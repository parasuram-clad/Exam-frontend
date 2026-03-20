import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import authService from "@/services/auth.service";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/utils";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        full_name: formData.name,
        email: formData.email,
        phone: `+91${formData.phone}`,
        password: formData.password
      };

      const response = await authService.register(signupData);
      toast.success(`Account created! Your username is ${response.username}`);
      navigate("/");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Registration failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#4FAA60]/10 to-[#4FAA60]/5 items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-64 h-64 mx-auto mb-8 bg-[#4FAA60]/20 rounded-full flex items-center justify-center">
            <div className="text-6xl">🎯</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Start Your Journey Today
          </h3>
          <p className="text-gray-600">
            Join thousands of aspirants preparing for TNPSC with structured study plans and practice tests.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="text-2xl font-medium font-goldman text-[#1a1c1e] mb-2 block">
            Thani Oruvan
          </Link>
          <p className="text-gray-500 mb-8">Create your account to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1.5 h-12 border-gray-200 focus:border-[#4FAA60] focus:ring-[#4FAA60]"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1.5 h-12 border-gray-200 focus:border-[#4FAA60] focus:ring-[#4FAA60]"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number
              </Label>
              <div className="relative mt-1.5 flex transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#4FAA60] focus-within:ring-2 focus-within:ring-[#4FAA60]/20">
                <div className="flex items-center justify-center px-4 bg-gray-50 border-r border-gray-200 text-gray-500 font-medium whitespace-nowrap">
                  +91
                </div>
                <div className="relative flex-1">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter 10 digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-12 border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none pl-4 pr-10"
                    required
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 border-gray-200 focus:border-[#4FAA60] focus:ring-[#4FAA60] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with a number and special character
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#4FAA60] focus:ring-[#4FAA60]"
                  required
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-[#4FAA60] hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-[#4FAA60] hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#4FAA60] hover:bg-[#45964f] text-white font-medium rounded-lg"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signup;
