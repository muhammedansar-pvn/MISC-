import type { Metadata } from 'next';
import ContactHero from '@/components/contact/ContactHero';
import SecretariatContact from '@/components/contact/SecretariatContact';
import ContactChannels from '@/components/contact/ContactChannels';
import ContactForm from '@/components/contact/ContactForm';
import ContactNotice from '@/components/contact/ContactNotice';
import ContactCTA from '@/components/contact/ContactCTA';

export const metadata: Metadata = {
  title: 'Contact Secretariat | Markaz Sanaviyya Academy · Jamia Markaz',
  description:
    'Get in touch with the Markaz Sanaviyya Academy Secretariat at Jamia Markaz, Karanthur, Kozhikode.',
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
