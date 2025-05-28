import React from 'react';
import { Github, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">About</h1>
        <div className="flex gap-6">
            
            
            <div className="glass-panel p-6 rounded-xl max-w-2xl w-full space-y-6">
                <div>
                <h2 className="text-lg font-medium mb-2">Stable Diffusion ControlNet Playground</h2>
                <p className="text-surface-300">
                    An interactive platform for experimenting with Stable Diffusion and ControlNet models.
                    Upload images, apply different preprocessors, and generate AI-powered variations.
                </p>
                </div>
                
                <div>
                <h3 className="text-md font-medium mb-2">Features</h3>
                <ul className="list-disc list-inside text-surface-300 space-y-1">
                    <li>Multiple ControlNet preprocessors (Canny Edge, Pose, Depth)</li>
                    <li>Real-time generation status updates</li>
                    <li>Generation history tracking</li>
                    <li>Customizable interface themes</li>
                </ul>
                </div>
                
                <div>
                <h3 className="text-md font-medium mb-2">Links</h3>
                <div className="flex space-x-4">
                    <a 
                    href="https://github.com/amir2628/ai-image-studio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 glass-button px-4 py-2 text-surface-300 hover:text-white"
                    >
                    <Github size={18} />
                    <span>GitHub</span>
                    </a>
                    <a 
                    href="https://stability.ai/stable-diffusion" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 glass-button px-4 py-2 text-surface-300 hover:text-white"
                    >
                    <Globe size={18} />
                    <span>Learn More</span>
                    </a>
                </div>
                </div>
            </div>

                <div className="glass-panel p-6 rounded-xl max-w-2xl w-full space-y-6">
                    <div>
                    <h2 className="text-lg font-medium mb-2">Песочница Stable Diffusion с поддержкой ControlNet</h2>
                    <p className="text-surface-300">
                        Интерактивная платформа для экспериментов с моделями Stable Diffusion и ControlNet.
                        Загружайте изображения, применяйте различные препроцессоры и создавайте варианты с помощью ИИ.
                    </p>
                    </div>
                    
                    <div>
                    <h3 className="text-md font-medium mb-2">Возможности:</h3>
                    <ul className="list-disc list-inside text-surface-300 space-y-1">
                        <li>Несколько препроцессоров ControlNet (контур Canny, поза, глубина)</li>
                        <li>Обновление статуса генерации в реальном времени</li>
                        <li>История генераций</li>
                        <li>Настраиваемые темы интерфейса</li>
                    </ul>
                    </div>
                    
                    <div>
                    <h3 className="text-md font-medium mb-2">Ссылки</h3>
                    <div className="flex space-x-4">
                        <a 
                        href="https://github.com/amir2628/ai-image-studio" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 glass-button px-4 py-2 text-surface-300 hover:text-white"
                        >
                        <Github size={18} />
                        <span>GitHub</span>
                        </a>
                        <a 
                        href="https://stability.ai/stable-diffusion" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 glass-button px-4 py-2 text-surface-300 hover:text-white"
                        >
                        <Globe size={18} />
                        <span>Узнайте больше</span>
                        </a>
                    </div>
                    </div>
            </div>
        </div>
    </div>
  );
};

export default AboutPage;