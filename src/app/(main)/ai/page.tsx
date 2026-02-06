'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, HStack, Button, Input, Flex } from '@chakra-ui/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ خطأ: ${data.error || 'حدث خطأ في الاتصال'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ خطأ في الاتصال بالخادم',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Box minH="100vh" bg="bg.primary" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" py={4} px={6}>
        <Container maxW="container.lg">
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <Heading as="h1" size="lg" color="white">
                🤖 Typhoon AI
              </Heading>
              <Text color="whiteAlpha.800" fontSize="sm">
                تحدث مع الذكاء الاصطناعي بالعربية أو الإنجليزية
              </Text>
            </VStack>
            <Button 
              variant="outline" 
              size="sm" 
              color="white" 
              borderColor="whiteAlpha.500"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={clearChat}
            >
              محادثة جديدة
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* Chat Messages */}
      <Box flex="1" overflowY="auto" py={6}>
        <Container maxW="container.lg">
          <VStack gap={4} align="stretch">
            {messages.length === 0 ? (
              <VStack py={20} gap={4}>
                <Text fontSize="6xl">🤖</Text>
                <Heading size="lg" color="text.primary" textAlign="center">
                  مرحباً! أنا Typhoon AI
                </Heading>
                <Text color="text.secondary" textAlign="center" maxW="md">
                  يمكنني مساعدتك في الإجابة على الأسئلة، كتابة النصوص، الترجمة، والمزيد.
                  ابدأ المحادثة الآن!
                </Text>
                <HStack gap={2} flexWrap="wrap" justify="center" mt={4}>
                  {['ما هو محسّن؟', 'ترجم لي نصاً', 'اكتب لي مقالاً', 'لخص لي هذا'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      size="sm"
                      variant="outline"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </HStack>
              </VStack>
            ) : (
              messages.map((message) => (
                <Flex
                  key={message.id}
                  justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Box
                    maxW="80%"
                    bg={message.role === 'user' ? 'brand.glow' : 'bg.elevated'}
                    color={message.role === 'user' ? 'white' : 'text.primary'}
                    px={4}
                    py={3}
                    borderRadius="lg"
                    borderTopRightRadius={message.role === 'user' ? '4px' : 'lg'}
                    borderTopLeftRadius={message.role === 'assistant' ? '4px' : 'lg'}
                  >
                    <Text whiteSpace="pre-wrap" dir="auto">
                      {message.content}
                    </Text>
                    <Text 
                      fontSize="xs" 
                      color={message.role === 'user' ? 'whiteAlpha.700' : 'text.tertiary'}
                      mt={1}
                    >
                      {message.timestamp.toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </Box>
                </Flex>
              ))
            )}
            
            {isLoading && (
              <Flex justify="flex-start">
                <Box bg="bg.elevated" px={4} py={3} borderRadius="lg">
                  <HStack gap={1}>
                    <Text>جاري التفكير...</Text>
                  </HStack>
                </Box>
              </Flex>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>
        </Container>
      </Box>

      {/* Input Area */}
      <Box 
        bg="bg.elevated" 
        borderTop="1px solid" 
        borderColor="border.default" 
        py={4} 
        px={6}
      >
        <Container maxW="container.lg">
          <HStack gap={3}>
            <Input
              flex="1"
              placeholder="اكتب رسالتك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              bg="bg.primary"
              borderColor="border.default"
              _focus={{ borderColor: 'brand.glow', boxShadow: '0 0 0 1px var(--chakra-colors-brand-glow)' }}
              disabled={isLoading}
              dir="auto"
              size="lg"
            />
            <Button
              bg="brand.glow"
              color="white"
              size="lg"
              px={8}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              _hover={{ opacity: 0.9 }}
              _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              {isLoading ? '...' : 'إرسال'}
            </Button>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
}
