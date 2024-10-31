'use client'

import React, { useState, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { generatePrompt } from '@/services/api/deepseek'

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'text' | 'image';
}

export const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  onClose,
  type
}) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: type === 'text' 
        ? "I'm your AI prompt engineering assistant. Let's create a perfect text prompt together. What's your goal? 🎯"
        : "I'm your AI image prompt expert. Let's craft an amazing image prompt together. What kind of image are you envisioning? 🎨"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage = { role: 'user' as const, content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await generatePrompt(userInput, type);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I encountered an error. Let's try again! 🔄" 
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          {/* 背景模糊和动画效果 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="mx-auto max-w-2xl w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
                        rounded-2xl shadow-2xl p-6 relative border border-gray-700/50
                        backdrop-blur-lg text-white overflow-hidden"
            >
              {/* 动态背景效果 */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,0,0,0))]" />
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="absolute inset-0 opacity-30 bg-[length:40px_40px] bg-grid-white/10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              </div>

              {/* 标题区域 */}
              <div className="relative flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
                <Dialog.Title className="text-xl font-semibold flex items-center gap-3">
                  <motion.span 
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    {type === 'text' ? '✍️' : '🎨'}
                  </motion.span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r 
                                 from-blue-400 via-purple-400 to-pink-400">
                    {type === 'text' ? 'Text Prompt Writer' : 'Image Prompt Writer'}
                  </span>
                </Dialog.Title>
                
                {/* 改进的关闭按钮 */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 
                           border border-gray-600/50 transition-colors group"
                >
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* 对话区域 */}
              <div className="relative h-[400px] overflow-y-auto mb-6 rounded-xl bg-gray-800/30 p-6">
                {messages.map((message, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`mb-4 ${
                      message.role === 'user' 
                        ? 'flex justify-end' 
                        : 'flex justify-start'
                    }`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20'
                        : 'bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg shadow-purple-500/10'
                    }`}>
                      <div>
                        {message.content}
                        {message.role === 'assistant' && message.content.includes('prompt') && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className="mt-2 px-3 py-1 text-xs bg-gray-800/50 
                                     rounded-lg hover:bg-gray-700/50 transition-colors
                                     flex items-center gap-1"
                          >
                            <span>📋</span>
                            Copy Prompt
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="relative">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border-2 border-gray-700/50 
                             rounded-xl focus:outline-none focus:border-blue-500/50 
                             transition-colors text-white placeholder-gray-400
                             shadow-inner shadow-black/20 disabled:opacity-50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                             text-white rounded-xl transition-all duration-200 
                             font-medium shadow-lg shadow-blue-500/20 
                             hover:shadow-blue-500/40 hover:from-blue-600 
                             hover:via-purple-600 hover:to-pink-600
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          🔄
                        </motion.span>
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Send</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default PromptDialog; 