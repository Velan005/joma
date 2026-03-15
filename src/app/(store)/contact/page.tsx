'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl mb-3">Contact Us</h1>
        <p className="text-muted-foreground font-body text-sm">We'd love to hear from you</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
          <input required type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
          <textarea required rows={5} placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground resize-none" />
          <button type="submit" className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium">
            Send Message
          </button>
        </form>

        <div className="space-y-8">
          <div className="flex gap-4">
            <Mail className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div>
              <h3 className="font-body text-sm font-medium mb-1">Email</h3>
              <p className="font-body text-sm text-muted-foreground">hello@joma.com</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div>
              <h3 className="font-body text-sm font-medium mb-1">Phone</h3>
              <p className="font-body text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex gap-4">
            <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div>
              <h3 className="font-body text-sm font-medium mb-1">Visit Us</h3>
              <p className="font-body text-sm text-muted-foreground">123 Fashion Ave<br />New York, NY 10001</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
