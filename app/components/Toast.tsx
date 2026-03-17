'use client';

import { useEffect } from 'react';

type Props = {
  message: string;
  onClose: () => void;
};

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className="toast">{message}</div>;
}
