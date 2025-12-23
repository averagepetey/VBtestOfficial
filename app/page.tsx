'use client';

import { useState, useEffect, useRef } from 'react';

type FormDataState = {
  name: string;
  email: string;
  design: string;
  file: File | null;
};

export default function Home() {
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    design: '',
    file: null,
  });

  const [fileName, setFileName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Debug: Log when imagePreview changes
  useEffect(() => {
    console.log('imagePreview changed:', imagePreview ? 'Has preview' : 'No preview');
    console.log('fileName:', fileName);
    console.log('formData.file:', formData.file ? formData.file.name : 'null');
  }, [imagePreview, fileName, formData.file]);

  const handleFileSelect = (file: File) => {
    console.log('handleFileSelect called with:', file.name, file.size, file.type);
    
    // Clean up previous preview if exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Clear any previous error immediately
    setFileError('');
    
    // Store file in ref for reliable access
    fileRef.current = file;
    
    // Create preview URL first
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Update form data - use functional update to ensure we get the latest state
    setFormData((prev) => {
      const updated = {
        ...prev,
        file: file,
      };
      console.log('Updated formData with file:', updated);
      return updated;
    });
    setFileName(file.name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files && files[0]) {
      console.log('File selected via input:', files[0].name);
      handleFileSelect(files[0]);
    } else if (name === 'name' || name === 'email' || name === 'design') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const isValidImage = file.type.startsWith('image/jpeg') || 
                          file.type.startsWith('image/png') ||
                          file.type.startsWith('image/jpg');
      
      if (isValidImage) {
        console.log('File dropped:', file.name);
        handleFileSelect(file);
      } else {
        setFileError('Please select a JPG or PNG image file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Try multiple sources to get the file (most reliable first)
    let finalFile: File | null = null;
    
    // 1. Check fileRef (most reliable - set immediately)
    if (fileRef.current) {
      finalFile = fileRef.current;
    }
    // 2. Check formData state
    else if (formData.file) {
      finalFile = formData.file;
    }
    // 3. Check file input directly as last resort
    else if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
      finalFile = fileInputRef.current.files[0];
      // Update ref and state for next time
      fileRef.current = finalFile;
      setFormData((prev) => ({ ...prev, file: finalFile! }));
    }
    
    // Validation
    if (!finalFile) {
      console.error('No file found in any source:', { 
        fileRef: fileRef.current,
        formDataFile: formData.file,
        imagePreview,
        fileName,
        inputFiles: fileInputRef.current?.files
      });
      setFileError('Please select a file');
      return;
    }
    
    // Clear any previous errors and success messages
    setFileError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);
    
    try {
      // Create FormData for API
      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name);
      uploadFormData.append('email', formData.email);
      uploadFormData.append('design', formData.design);
      uploadFormData.append('file', finalFile);
      
      console.log('Submitting form:', {
        name: formData.name,
        email: formData.email,
        design: formData.design,
        fileName: finalFile.name,
        fileSize: finalFile.size,
        fileType: finalFile.type,
      });
      
      // Submit to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Upload successful:', result);
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          design: '',
          file: null,
        });
        setFileName('');
        fileRef.current = null;
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        
        // Success message will stay until page refresh
      } else {
        console.error('❌ Upload failed:', result);
        setFileError(result.error || 'Failed to upload file. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFileError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header / Hero Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">
              JPG → DST Converter
            </h1>
            <p className="text-xl text-gray-600">
              Convert your designs to DST files quickly and reliably
            </p>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
              Perfect for print shops and embroidery clients. Transform your JPG images into 
              professional DST embroidery files with our automated digitization service.
            </p>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload JPG</h3>
              <p className="text-gray-600">
                Upload your JPG image file through our simple form. Include your design details 
                and contact information.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-digitize</h3>
              <p className="text-gray-600">
                Our system automatically converts your image into a DST embroidery file format, 
                ready for your embroidery machine.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Receive DST file</h3>
              <p className="text-gray-600">
                Download your converted DST file via email. Your design is ready to use with 
                standard embroidery equipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Form Section */}
      <section className="py-16 bg-gray-50 flex-grow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Upload Your Design
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
                />
              </div>

              {/* Design Description Field */}
              <div>
                <label htmlFor="design" className="block text-sm font-medium text-gray-700 mb-2">
                  Design Name / Description
                </label>
                <input
                  type="text"
                  id="design"
                  name="design"
                  placeholder="Company Logo - Red and Blue"
                  value={formData.design}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
                />
              </div>

              {/* File Upload Field */}
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  JPG Image File {fileName && <span className="text-green-600">✓ {fileName}</span>}
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition relative ${
                    imagePreview 
                      ? 'border-green-400 bg-green-50' 
                      : fileError 
                        ? 'border-red-300' 
                        : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {imagePreview ? (
                    <div className="w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg object-contain shadow-md"
                        onError={(e) => {
                          console.error('Image preview failed to load');
                          setImagePreview(null);
                        }}
                      />
                      <div className="mt-4 text-center">
                        <p className="text-sm text-green-600 font-medium">{fileName}</p>
                        <label
                          htmlFor="file-change"
                          className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-500 cursor-pointer underline"
                        >
                          Change image
                        </label>
                        <input
                          ref={fileInputRef}
                          id="file-change"
                          name="file"
                          type="file"
                          accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG"
                          onChange={handleChange}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4h12m-4 4v12m0 0l-4-4m4 4l4-4"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                        <input
                          ref={fileInputRef}
                          id="file-upload"
                          name="file"
                          type="file"
                          accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG"
                          onChange={handleChange}
                          className="sr-only"
                        />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">JPG, JPEG, or PNG up to 10MB</p>
                    </div>
                  )}
                </div>
                {fileError && !formData.file && (
                  <p className="mt-2 text-sm text-red-600">{fileError}</p>
                )}
              </div>

              {/* Success Message */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  <p className="font-medium">✅ Upload successful!</p>
                  <p className="text-sm mt-1">Your design has been submitted. We'll process it and send you the DST file via email.</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Uploading...' : 'Submit Design'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">Contact</h3>
              <p className="text-sm">
                Need help? Reach out to us for support with your conversions.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Important Note</h3>
              <p className="text-sm text-gray-400">
                Auto-digitization may require manual correction for complex designs. 
                Results may vary based on image quality and design complexity. 
                We recommend reviewing your DST file before production use.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} JPG → DST Converter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
