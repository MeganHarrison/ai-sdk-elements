import { File, Search } from 'lucide-react';

import { LoginForm } from '@/components/login-form';

export default function NewLoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <File className="size-4" />
            </div>
            Alleato Group
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 relative hidden lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* PNG File Icon Design */}
          <div className="relative">
            {/* Main document/file container */}
            <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* File header with corner fold */}
              <div className="relative h-full">
                {/* Corner fold effect */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gray-200 transform rotate-45 translate-x-8 -translate-y-8"></div>
                <div className="absolute top-0 right-0 w-12 h-12 bg-white border-l border-b border-gray-300"></div>
                
                {/* Image preview area */}
                <div className="p-8 h-3/5 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg overflow-hidden relative">
                    {/* Ocean/landscape image representation */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-6 bg-gray-700 rounded-sm opacity-50"></div>
                    <div className="absolute bottom-8 right-6 w-6 h-4 bg-gray-600 rounded-sm opacity-40"></div>
                    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-white/30 rounded-full"></div>
                  </div>
                </div>
                
                {/* PNG label */}
                <div className="px-8 pb-8 flex items-center justify-center">
                  <div className="text-6xl font-bold text-gray-600 tracking-wider">
                    PNG
                  </div>
                </div>
              </div>
            </div>
            
            {/* Magnifying glass icon */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(156 163 175) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
      </div>
    </div>
  );
}