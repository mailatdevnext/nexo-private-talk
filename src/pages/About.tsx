
import React from 'react';
import { NexoLogo } from '@/components/NexoLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Code, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <NexoLogo size="lg" className="justify-center" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              About NEXO
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A modern chat application designed for seamless communication and connection.
            </p>
          </div>

          {/* Developer Section */}
          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Code className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Made by DEVNEXT</h2>
                  <p className="text-lg text-primary font-semibold mb-2">Created by VARUN.S</p>
                  <p className="text-gray-400">A passionate school student developer</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Fast & Responsive</h3>
                    <p className="text-sm text-gray-400">Built with modern web technologies</p>
                  </div>
                  <div className="text-center">
                    <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Made with Passion</h3>
                    <p className="text-sm text-gray-400">Crafted by a dedicated student</p>
                  </div>
                  <div className="text-center">
                    <Code className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Open Source Spirit</h3>
                    <p className="text-sm text-gray-400">Learning and sharing knowledge</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">About the App</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  NEXO is a modern chat application that brings people together through seamless communication. 
                  Built with cutting-edge web technologies, it offers a smooth and intuitive user experience.
                </p>
                <p>
                  This project represents the passion and dedication of a young developer who believes in 
                  the power of technology to connect people and make communication more accessible.
                </p>
                <p>
                  Developed as part of the learning journey, NEXO showcases modern web development 
                  practices and the potential of student innovation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
