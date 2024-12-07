import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageUpload from '../ImageUpload';
import Image from 'next/image';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('ImageUpload Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders image upload area and input', () => {
    render(<ImageUpload onImageChange={() => {}} />);
    
    expect(screen.getByText(/change image/i)).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByText(/supports jpg, png, gif and webp/i)).toBeInTheDocument();
  });

  it('shows error for invalid file type', async () => {
    render(<ImageUpload onImageChange={() => {}} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/please upload an image file/i)).toBeInTheDocument();
    });
  });

  it('shows error for large file size', async () => {
    render(<ImageUpload onImageChange={() => {}} />);
    
    // Create a mock file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [largeFile] } });
    
    await waitFor(() => {
      expect(screen.getByText(/image size should be less than 5mb/i)).toBeInTheDocument();
    });
  });

  it('calls onImageChange with the uploaded file URL', async () => {
    const mockOnImageChange = jest.fn();
    const mockResponse = { filename: 'uploaded-image.jpg' };
    
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    render(<ImageUpload onImageChange={mockOnImageChange} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnImageChange).toHaveBeenCalledWith(mockResponse.filename);
    });
  });

  it('shows error message on upload failure', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Upload failed'),
      })
    );

    render(<ImageUpload onImageChange={() => {}} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });
});
