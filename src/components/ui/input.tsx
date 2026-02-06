'use client';

/**
 * Input Component
 * Styled input fields for forms
 */

import {
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  Textarea as ChakraTextarea,
  TextareaProps as ChakraTextareaProps,
  Box,
  Text,
} from '@chakra-ui/react';
import { forwardRef, ReactNode } from 'react';

export interface InputProps extends ChakraInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

const inputStyles = {
  bg: 'gray.900',
  border: '1px solid',
  borderColor: 'gray.700',
  color: 'white',
  borderRadius: 'lg',
  px: 4,
  py: 2,
  _placeholder: { color: 'gray.500' },
  _hover: { borderColor: 'gray.600' },
  _focus: {
    borderColor: 'brand.500',
    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
    outline: 'none',
  },
  _invalid: {
    borderColor: 'red.500',
    boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftElement, rightElement, ...props }, ref) => {
    return (
      <Box w="full">
        {label && (
          <Text mb={2} fontSize="sm" fontWeight="medium" color="gray.300">
            {label}
          </Text>
        )}
        <Box position="relative">
          {leftElement && (
            <Box
              position="absolute"
              right={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.500"
              zIndex={1}
            >
              {leftElement}
            </Box>
          )}
          <ChakraInput
            ref={ref}
            {...inputStyles}
            pr={leftElement ? 10 : 4}
            pl={rightElement ? 10 : 4}
            {...props}
          />
          {rightElement && (
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.500"
              zIndex={1}
            >
              {rightElement}
            </Box>
          )}
        </Box>
        {error && (
          <Text mt={1} fontSize="sm" color="red.400">
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text mt={1} fontSize="sm" color="gray.500">
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends ChakraTextareaProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, ...props }, ref) => {
    return (
      <Box w="full">
        {label && (
          <Text mb={2} fontSize="sm" fontWeight="medium" color="gray.300">
            {label}
          </Text>
        )}
        <ChakraTextarea
          ref={ref}
          {...inputStyles}
          minH="120px"
          resize="vertical"
          {...props}
        />
        {error && (
          <Text mt={1} fontSize="sm" color="red.400">
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text mt={1} fontSize="sm" color="gray.500">
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);

Textarea.displayName = 'Textarea';
