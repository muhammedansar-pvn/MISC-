import type { Metadata } from 'next';
import ContactHero from '@/components/contact/ContactHero';
import SecretariatContact from '@/components/contact/SecretariatContact';
import ContactChannels from '@/components/contact/ContactChannels';
import ContactForm from '@/components/contact/ContactForm';
import ContactNotice from '@/components/contact/ContactNotice';
import ContactCTA from '@/components/contact/ContactCTA';

export const metadata: Metadata = {
  title: 'Contact Us - Markaz Integrated Studies Council',
  description:
    'Get in touch with the MISC Secretariat at Jamia Markaz, Karanthur, Kozhikode.',
};

export default function ContactPage() {
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
}
