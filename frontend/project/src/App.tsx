/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { ClipboardCheck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  website: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  website?: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    website: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website.trim() && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm() || !recaptchaValue || !privacyAccepted) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const generatedUuid = uuidv4(); 
  
      const response = await fetch('http://127.0.0.1:5000//audit', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          emailid: formData.email,
          url: formData.website,
          phone: formData.phone,
          uuid: generatedUuid
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
  
      // Receive PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Create a download link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lighthouse-report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        website: '',
      });
      setPrivacyAccepted(false);
      setRecaptchaValue(null);
  
      alert('Audit completed! Report downloaded.');
    } catch (error: any) {
      alert(error.message || 'An error occurred while submitting the form.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaValue(token);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <ClipboardCheck className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Contact Form</h2>
        </div>
        
        <form autoComplete='false' onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.fullName ? 'border-red-300' : 'border-gray-300'
              } focus:border-indigo-500 focus:ring-indigo-500`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } focus:border-indigo-500 focus:ring-indigo-500`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              } focus:border-indigo-500 focus:ring-indigo-500`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.website ? 'border-red-300' : 'border-gray-300'
              } focus:border-indigo-500 focus:ring-indigo-500`}
              placeholder="https://"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website}</p>
            )}
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={onRecaptchaChange}
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="privacy"
                name="privacy"
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="privacy" className="font-medium text-gray-700">
                I accept the privacy policy
              </label>
              <p className="text-gray-500">
                By checking this box, you agree to our{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!recaptchaValue || !privacyAccepted || isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !recaptchaValue || !privacyAccepted || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;