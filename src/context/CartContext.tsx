'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, OrderDetails } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  tableNumber: string;
  setTableNumber: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  orderType: 'table' | 'delivery' | 'takeaway';
  setOrderType: (val: 'table' | 'delivery' | 'takeaway') => void;
  paymentMethod: 'pix' | 'card' | 'cash';
  setPaymentMethod: (val: 'pix' | 'card' | 'cash') => void;
  notes: string;
  setNotes: (val: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalAmount: number;
  totalCount: number;
  generateWhatsAppLink: (phone: string, tenantName: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [orderType, setOrderType] = useState<'table' | 'delivery' | 'takeaway'>('table');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix');
  const [notes, setNotes] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('konnexy_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('konnexy_cart', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  const addItem = (product: Product, quantity: number = 1, itemNotes?: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (itemNotes) updated[existingIndex].notes = itemNotes;
        return updated;
      }
      return [...prev, { product, quantity, notes: itemNotes }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setNotes('');
  };

  const totalAmount = items.reduce((acc, item) => {
    const price = item.product.promo_price || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const generateWhatsAppLink = (phone: string, tenantName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    let text = `🛒 *NOVO PEDIDO - ${tenantName.toUpperCase()}*\n`;
    text += `\n👤 *Cliente:* ${customerName || 'Não informado'}`;
    
    if (orderType === 'table') {
      text += `\n📍 *Tipo:* Consumo no Local ${tableNumber ? `(Mesa ${tableNumber})` : ''}`;
    } else if (orderType === 'delivery') {
      text += `\n🛵 *Tipo:* Delivery para Entrega`;
    } else {
      text += `\n🛍️ *Tipo:* Retirada no Balcão`;
    }
    
    text += `\n💳 *Pagamento:* ${paymentMethod.toUpperCase()}`;
    text += `\n\n------------------------------\n*ITENS DO PEDIDO:*\n`;

    items.forEach((item, index) => {
      const unitPrice = item.product.promo_price || item.product.price;
      const itemTotal = unitPrice * item.quantity;
      text += `\n*${item.quantity}x ${item.product.name}* - R$ ${itemTotal.toFixed(2)}`;
      if (item.notes) {
        text += `\n   ↳ _Obs: ${item.notes}_`;
      }
    });

    text += `\n\n------------------------------`;
    text += `\n💰 *VALOR TOTAL: R$ ${totalAmount.toFixed(2)}*`;

    if (notes) {
      text += `\n\n📝 *Observações Gerais:*\n${notes}`;
    }

    text += `\n\n_Enviado via Konnexy Menu (Cardápio Digital Inteligente)_`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        orderType,
        setOrderType,
        paymentMethod,
        setPaymentMethod,
        notes,
        setNotes,
        isCartOpen,
        setIsCartOpen,
        totalAmount,
        totalCount,
        generateWhatsAppLink,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
