import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IncidentList from './IncidentList';
import { incidentService } from '../../services/incidentService';
import { createWrapper, mockIncidents, defaultAuth } from '../../test/testUtils';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../services/incidentService');
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthContext: { Provider: ({ children }) => children },
}));

const mockData = (overrides = {}) => ({
  data: {
    data: mockIncidents(),
    totalPages: 1,
    page: 1,
    total: 3,
    ...overrides,
  },
});

describe('IncidentList', () => {
  beforeEach(() => {
    useAuth.mockReturnValue(defaultAuth);
    incidentService.getAll.mockResolvedValue(mockData());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    render(<IncidentList />, { wrapper: createWrapper() });
    expect(screen.getByText('Incidents')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('3 total incidents')).toBeInTheDocument());
  });

  it('renders the Create Incident button', () => {
    render(<IncidentList />, { wrapper: createWrapper() });
    expect(screen.getByText('Create Incident')).toBeInTheDocument();
  });

  it('renders incident rows after loading', async () => {
    render(<IncidentList />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Server down - production database')).toBeInTheDocument();
      expect(screen.getByText('Email service outage')).toBeInTheDocument();
      expect(screen.getByText('VPN connection issues')).toBeInTheDocument();
    });
  });

  it('renders incident IDs', async () => {
    render(<IncidentList />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('INC-001')).toBeInTheDocument();
      expect(screen.getByText('INC-002')).toBeInTheDocument();
      expect(screen.getByText('INC-003')).toBeInTheDocument();
    });
  });

  it('renders View buttons for each incident', async () => {
    render(<IncidentList />, { wrapper: createWrapper() });
    const viewButtons = await screen.findAllByText('View');
    expect(viewButtons).toHaveLength(3);
  });

  it('shows loading skeleton initially', () => {
    incidentService.getAll.mockImplementation(() => new Promise(() => {}));
    render(<IncidentList />, { wrapper: createWrapper() });
    expect(document.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('shows error state on API failure', async () => {
    incidentService.getAll.mockRejectedValue(new Error('Network error'));
    render(<IncidentList />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Failed to load incidents')).toBeInTheDocument();
    });
  });

  it('shows empty state when no incidents', async () => {
    incidentService.getAll.mockResolvedValue({
      data: { data: [], totalPages: 0, page: 1, total: 0 },
    });
    render(<IncidentList />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No incidents found')).toBeInTheDocument();
    });
  });

  it('shows filter-specific empty message when filters are active', async () => {
    incidentService.getAll.mockImplementation((params) => {
      if (params?.status === 'closed') {
        return Promise.resolve({
          data: { data: [], totalPages: 0, page: 1, total: 0 },
        });
      }
      return Promise.resolve(mockData());
    });

    render(<IncidentList />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText('3 total incidents')).toBeInTheDocument());

    const statusSelect = screen.getByDisplayValue('All Statuses');
    await userEvent.selectOptions(statusSelect, 'closed');

    await waitFor(() => {
      expect(screen.getByText('No incidents found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });
  });

  it('filters incidents by status', async () => {
    const statusFilterMock = vi.fn().mockImplementation((params) => {
      if (params?.status === 'resolved') {
        return Promise.resolve({
          data: { data: [mockIncidents()[2]], totalPages: 1, page: 1, total: 1 },
        });
      }
      return Promise.resolve(mockData());
    });

    incidentService.getAll.mockImplementation(statusFilterMock);

    render(<IncidentList />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText('3 total incidents')).toBeInTheDocument());

    const statusSelect = screen.getByDisplayValue('All Statuses');
    await userEvent.selectOptions(statusSelect, 'resolved');

    await waitFor(() => {
      expect(statusFilterMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'resolved' })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('1 total incidents')).toBeInTheDocument();
    });
  });

  it('resets to page 1 when filter changes', async () => {
    render(<IncidentList />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText('3 total incidents')).toBeInTheDocument());

    const prioritySelect = screen.getByDisplayValue('All Priorities');
    await userEvent.selectOptions(prioritySelect, 'high');

    await waitFor(() => {
      expect(incidentService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ priority: 'high', page: 1 })
      );
    });
  });

  it('calls API with correct default params', async () => {
    render(<IncidentList />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(incidentService.getAll).toHaveBeenCalledWith({
        sort: 'createdAt',
        order: 'desc',
        page: 1,
        limit: 10,
      });
    });
  });

  it('searches by text input', async () => {
    render(<IncidentList />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('3 total incidents')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Search by title or ID...');
    await userEvent.type(searchInput, 'VPN');

    await waitFor(() => {
      expect(incidentService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'VPN', page: 1 })
      );
    });
  });

  it('renders pagination controls', async () => {
    incidentService.getAll.mockResolvedValue(
      mockData({
        data: Array.from({ length: 25 }, (_, i) => ({
          ...mockIncidents()[0],
          _id: `inc${i + 1}`,
          incidentId: `INC-${String(i + 1).padStart(3, '0')}`,
          title: `Incident ${i + 1}`,
        })),
        totalPages: 3,
        total: 25,
      })
    );

    render(<IncidentList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('navigates to next page', async () => {
    const manyIncidents = Array.from({ length: 25 }, (_, i) => ({
      ...mockIncidents()[0],
      _id: `inc${i + 1}`,
      title: `Incident ${i + 1}`,
    }));

    incidentService.getAll.mockImplementation((params) => {
      const page = params?.page || 1;
      const start = (page - 1) * 10;
      return Promise.resolve({
        data: {
          data: manyIncidents.slice(start, start + 10),
          totalPages: 3,
          page,
          total: 25,
        },
      });
    });

    render(<IncidentList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const page2Btn = screen.getByText('2');
    fireEvent.click(page2Btn);

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });
  });
});
