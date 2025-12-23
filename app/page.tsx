'use client';

import { useState } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files && files[0]) {
      setFormData({
        ...formData,
        file: files[0],
      });
      setFileName(files[0].name);
    } else if (name === 'name' || name === 'email' || name === 'design') {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Upload submitted! (serverless function not connected yet)');
    console.log(formData);
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* File Upload Field */}
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  JPG Image File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition">
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
                        htmlFor="file"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file"
                          name="file"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleChange}
                          required
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">JPG, JPEG, or PNG up to 10MB</p>
                    {fileName && (
                      <p className="text-sm text-green-600 mt-2">Selected: {fileName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-md hover:shadow-lg"
              >
                Submit Design
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
