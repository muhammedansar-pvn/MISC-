import React from 'react';
import ContactHero from '../components/contact/ContactHero';
import SecretariatContact from '../components/contact/SecretariatContact';
import ContactChannels from '../components/contact/ContactChannels';
import ContactForm from '../components/contact/ContactForm';
import ContactNotice from '../components/contact/ContactNotice';
import ContactCTA from '../components/contact/ContactCTA';

export const ContactPage = () => {
  return (
    <div className="w-full">
      <ContactHero />
      <SecretariatContact />
      <ContactChannels />
      <ContactForm />
      <ContactNotice />
      <ContactCTA />
    </div>
  );
};

export default ContactPage;
