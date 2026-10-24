import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import CreateIncident from './CreateIncident';
import { incidentService } from '../../services/incidentService';
import { departmentService } from '../../services/departmentService';
import { createWrapper, mockDepartments, defaultAuth } from '../../test/testUtils';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../services/incidentService');
vi.mock('../../services/departmentService');
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthContext: { Provider: ({ children }) => children },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function findForm() {
  return document.querySelector('form');
}

describe('CreateIncident', () => {
  beforeEach(() => {
    useAuth.mockReturnValue(defaultAuth);
    incidentService.create.mockResolvedValue({ data: { data: { _id: 'new-inc' } } });
    departmentService.getAll.mockResolvedValue({
      data: { data: mockDepartments() },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form heading', () => {
    render(<CreateIncident />, { wrapper: createWrapper() });
    expect(screen.getByText('Report a new issue or problem')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<CreateIncident />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('Brief description of the issue')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Detailed description of the issue...')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
  });

  it('shows validation errors for empty form', async () => {
    render(<CreateIncident />, { wrapper: createWrapper() });
    fireEvent.submit(findForm());

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 5 characters')).toBeInTheDocument();
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('shows validation for short title', async () => {
    render(<CreateIncident />, { wrapper: createWrapper() });

    await userEvent.type(
      screen.getByPlaceholderText('Brief description of the issue'),
      'ab'
    );
    fireEvent.submit(findForm());

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 5 characters')).toBeInTheDocument();
    });
  });

  it('shows description character counter', async () => {
    render(<CreateIncident />, { wrapper: createWrapper() });

    const descInput = screen.getByPlaceholderText('Detailed description of the issue...');
    await userEvent.type(descInput, 'Hello World');

    await waitFor(() => {
      const charElem = screen.getByText((content) => /^\d+ characters$/.test(content));
      expect(charElem.textContent).toBe('11 characters');
    });
  });

  it('loads department options from API', async () => {
    render(<CreateIncident />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(departmentService.getAll).toHaveBeenCalled();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('IT')).toBeInTheDocument();
    });
  });

  it('submits the form successfully', async () => {
    render(<CreateIncident />, { wrapper: createWrapper() });

    await userEvent.type(
      screen.getByPlaceholderText('Brief description of the issue'),
      'Server is down again'
    );
    await userEvent.type(
      screen.getByPlaceholderText('Detailed description of the issue...'),
      'The main production server is unresponsive to ping requests since 10am.'
    );

    const allSelects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(allSelects[0], 'critical');
    await userEvent.selectOptions(allSelects[1], 'server');

    await waitFor(() => expect(departmentService.getAll).toHaveBeenCalled());
    await userEvent.selectOptions(allSelects[2], 'dept1');

    fireEvent.submit(findForm());

    await waitFor(() => {
      expect(incidentService.create).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Incident created successfully');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/incidents');
    });
  });

  it('shows error toast on submission failure', async () => {
    incidentService.create.mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });

    render(<CreateIncident />, { wrapper: createWrapper() });

    await userEvent.type(
      screen.getByPlaceholderText('Brief description of the issue'),
      'Server is down again'
    );
    await userEvent.type(
      screen.getByPlaceholderText('Detailed description of the issue...'),
      'The main production server is unresponsive.'
    );

    const allSelects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(allSelects[0], 'critical');
    await userEvent.selectOptions(allSelects[1], 'server');

    await waitFor(() => expect(departmentService.getAll).toHaveBeenCalled());
    await userEvent.selectOptions(allSelects[2], 'dept1');

    fireEvent.submit(findForm());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });
});
