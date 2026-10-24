import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import IncidentDetails from './IncidentDetails';
import { incidentService } from '../../services/incidentService';
import { slaService } from '../../services/slaService';
import { userService } from '../../services/userService';
import { createWrapper, mockIncidents, mockEngineers, mockSla, defaultAuth } from '../../test/testUtils';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../services/incidentService');
vi.mock('../../services/slaService');
vi.mock('../../services/userService');
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthContext: { Provider: ({ children }) => children },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: 'inc1' }) };
});

describe('IncidentDetails', () => {
  beforeEach(() => {
    useAuth.mockReturnValue(defaultAuth);
    incidentService.getById.mockResolvedValue({ data: { data: mockIncidents()[0] } });
    slaService.getByIncident.mockResolvedValue({ data: { data: mockSla() } });
    userService.getAll.mockResolvedValue({ data: { data: mockEngineers() } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    incidentService.getById.mockImplementation(() => new Promise(() => {}));
    render(<IncidentDetails />, { wrapper: createWrapper() });
    expect(document.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('renders incident title and ID after loading', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Server down - production database')).toBeInTheDocument();
      expect(screen.getByText('INC-001')).toBeInTheDocument();
    });
  });

  it('renders incident status badge', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('open')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Production database server is unresponsive')).toBeInTheDocument();
    });
  });

  it('renders Details card with priority and category', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('server')).toBeInTheDocument();
    });
  });

  it('renders Assignment section', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getAllByText('John Engineer').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders SLA card', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('SLA Status')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('renders Resolve button for admin', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Resolve Incident')).toBeInTheDocument();
    });
  });

  it('resolves incident on button click', async () => {
    incidentService.update.mockResolvedValue({ data: {} });

    render(<IncidentDetails />, { wrapper: createWrapper() });

    const resolveBtn = await screen.findByText('Resolve Incident');
    fireEvent.click(resolveBtn.closest('button'));

    await waitFor(() => {
      expect(incidentService.update).toHaveBeenCalledWith('inc1', {
        resolutionNotes: 'Resolved',
        status: 'resolved',
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Incident resolved');
    });
  });

  it('shows Close button when incident is resolved', async () => {
    incidentService.getById.mockResolvedValue({
      data: { data: { ...mockIncidents()[0], status: 'resolved' } },
    });

    render(<IncidentDetails />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Close Incident')).toBeInTheDocument();
    });
  });

  it('closes incident on Close click', async () => {
    incidentService.getById.mockResolvedValue({
      data: { data: { ...mockIncidents()[0], status: 'resolved' } },
    });
    incidentService.close.mockResolvedValue({ data: {} });

    render(<IncidentDetails />, { wrapper: createWrapper() });

    const closeBtn = await screen.findByText('Close Incident');
    fireEvent.click(closeBtn.closest('button'));

    await waitFor(() => {
      expect(incidentService.close).toHaveBeenCalledWith('inc1', {});
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Incident closed');
    });
  });

  it('shows engineer select for admin users', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Assign to Engineer')).toBeInTheDocument();
      expect(screen.getAllByText('John Engineer').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Sarah Engineer').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('hides engineer select for non-admin non-manager', async () => {
    useAuth.mockReturnValue({
      ...defaultAuth,
      role: 'engineer',
      isAdmin: false,
      isManager: false,
      user: { ...defaultAuth.user, role: 'engineer' },
    });

    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.queryByText('Assign to Engineer')).not.toBeInTheDocument();
    });
  });

  it('assigns engineer from select', async () => {
    incidentService.assign.mockResolvedValue({ data: {} });

    render(<IncidentDetails />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Assign to Engineer')).toBeInTheDocument();
    });

    const engineerSelect = document.querySelector('select');
    await userEvent.selectOptions(engineerSelect, mockEngineers()[1]._id);

    const assignBtn = screen.getByText('Assign');
    await userEvent.click(assignBtn);

    await waitFor(() => {
      expect(incidentService.assign).toHaveBeenCalledWith('inc1', {
        assignedTo: mockEngineers()[1]._id,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Incident assigned successfully');
    });
  });

  it('renders comments with existing comments', async () => {
    const incidentWithComments = mockIncidents()[1];
    incidentService.getById.mockResolvedValue({ data: { data: incidentWithComments } });

    render(<IncidentDetails />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Looking into this')).toBeInTheDocument();
    });
  });

  it('shows no comments placeholder', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No comments yet.')).toBeInTheDocument();
    });
  });

  it('can type a comment', async () => {
    render(<IncidentDetails />, { wrapper: createWrapper() });

    const commentInput = await screen.findByPlaceholderText('Add a comment...');
    await userEvent.type(commentInput, 'This is a test comment');

    expect(commentInput).toHaveValue('This is a test comment');
  });

  it('renders error state for missing incident', async () => {
    incidentService.getById.mockRejectedValue(new Error('Not found'));

    render(<IncidentDetails />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Incident not found')).toBeInTheDocument();
      expect(screen.getByText('Back to Incidents')).toBeInTheDocument();
    });
  });
});
