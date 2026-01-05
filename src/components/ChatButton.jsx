import { useState } from 'react';

const ChatButton = ({ landlordName, landlordPhone, listingTitle }) => {
  const [showChat, setShowChat] = useState(false);

  const handleWhatsAppChat = () => {
    // Format phone number (remove special characters)
    const phoneNumber = landlordPhone?.replace(/[^0-9]/g, '') || '';
    if (!phoneNumber) {
      alert('Landlord phone number not available');
      return;
    }

    // Create WhatsApp message
    const message = `Hi ${landlordName}, I'm interested in the listing: "${listingTitle}". Can we discuss more details?`;
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="chat-button-container">
      <button 
        className="chat-btn whatsapp-btn"
        onClick={handleWhatsAppChat}
        title="Chat on WhatsApp"
      >
        💬 Chat on WhatsApp
      </button>
    </div>
  );
};

export default ChatButton;
