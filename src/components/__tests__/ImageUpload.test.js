import { render, screen, fireEvent } from '@testing-library/react';
import ImageUpload from '../ImageUpload';

describe('ImageUpload Component', () => {
  const mockOnImageChange = jest.fn();
  const defaultProps = {
    currentImage: '/default-profile.png',
    onImageChange: mockOnImageChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders image upload area and input', () => {
    render(<ImageUpload {...defaultProps} />);
    
    expect(screen.getByAltText('Profile Picture')).toBeInTheDocument();
    expect(screen.getByText('Change image')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('shows error for invalid file type', async () => {
    render(<ImageUpload {...defaultProps} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(await screen.findByText('File must be an image')).toBeInTheDocument();
  });

  it('shows error for large file size', async () => {
    render(<ImageUpload {...defaultProps} />);
    
    // Mock a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [largeFile] } });
    
    expect(await screen.findByText('Image must be less than 5MB')).toBeInTheDocument();
  });

  it('calls onImageChange with the uploaded file URL', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'uploaded-image.jpg' })
    });

    render(<ImageUpload {...defaultProps} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
    await screen.findByAltText('Profile Picture');
    expect(mockOnImageChange).toHaveBeenCalledWith('uploaded-image.jpg');
  });

  it('shows error message on upload failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false
    });

    render(<ImageUpload {...defaultProps} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(await screen.findByText('Failed to upload image. Please try again.')).toBeInTheDocument();
  });
});
