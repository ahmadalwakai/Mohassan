'use client';

/**
 * Avatar Component
 * User avatars with fallback
 */

import { Box, Image, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBorder?: boolean;
}

const sizes = {
  xs: { w: 6, h: 6, fontSize: 'xs' },
  sm: { w: 8, h: 8, fontSize: 'sm' },
  md: { w: 10, h: 10, fontSize: 'md' },
  lg: { w: 12, h: 12, fontSize: 'lg' },
  xl: { w: 16, h: 16, fontSize: 'xl' },
  '2xl': { w: 24, h: 24, fontSize: '2xl' },
};

// Generate initials from name
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '؟';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Generate color from name
const getColorFromName = (name: string | null | undefined): string => {
  if (!name) return 'gray.600';
  const colors = ['brand.600', 'blue.600', 'purple.600', 'pink.600', 'orange.600', 'teal.600'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name, size = 'md', showBorder = false }, ref) => {
    const sizeStyles = sizes[size];
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    return (
      <Box
        ref={ref}
        position="relative"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
        overflow="hidden"
        bg={bgColor}
        border={showBorder ? '2px solid' : 'none'}
        borderColor="gray.700"
        {...sizeStyles}
      >
        {src ? (
          <Image
            src={src}
            alt={name || 'Avatar'}
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : (
          <Text
            color="white"
            fontWeight="bold"
            fontSize={sizeStyles.fontSize}
            lineHeight={1}
          >
            {initials}
          </Text>
        )}
      </Box>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group
export interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string | null }>;
  max?: number;
  size?: AvatarProps['size'];
}

export const AvatarGroup = ({ avatars, max = 3, size = 'sm' }: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <Box display="flex" alignItems="center">
      {visibleAvatars.map((avatar, index) => (
        <Box
          key={index}
          mr={-2}
          zIndex={visibleAvatars.length - index}
        >
          <Avatar {...avatar} size={size} showBorder />
        </Box>
      ))}
      {remaining > 0 && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bg="gray.700"
          border="2px solid"
          borderColor="gray.800"
          mr={-2}
          {...sizes[size]}
        >
          <Text fontSize="xs" color="gray.300" fontWeight="medium">
            +{remaining}
          </Text>
        </Box>
      )}
    </Box>
  );
};
