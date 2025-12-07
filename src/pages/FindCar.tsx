import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Car, Search, Sparkles, User, Mail, Phone, Calendar, Palette, Settings, MessageSquare } from "lucide-react";

const carRequestSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phone: z.string().trim().min(1, { message: "Phone is required" }).max(20),
  model: z.string().trim().min(1, { message: "Car model is required" }).max(100),
  year: z.string().trim().max(4),
  color: z.string().trim().max(50),
  trim: z.string().trim().max(100),
  additional: z.string().trim().max(1000),
});

export default function FindCar() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    model: "",
    year: "",
    color: "",
    trim: "",
    additional: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = carRequestSchema.parse(formData);
      console.log("Form submitted:", validated);
      toast.success(t('form.success'));
      setFormData({
        name: "",
        email: "",
        phone: "",
        model: "",
        year: "",
        color: "",
        trim: "",
        additional: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-16 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-6 shadow-elegant">
            <Car className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            {t('form.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t('form.subtitle')}
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-70" />
            
            {/* Main card */}
            <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-elegant overflow-hidden">
              
              <div className="p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Info Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">Лична информация</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {t('form.name')}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                        placeholder="Вашето име"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          {t('form.email')}
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          maxLength={255}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          {t('form.phone')}
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          maxLength={20}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                          placeholder="+359 888 123 456"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full border-t border-border/50" />

                  {/* Car Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
                        <Search className="w-4 h-4 text-accent" />
                      </div>
                      <h3 className="font-semibold text-foreground">Детайли за автомобила</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-sm font-medium flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-muted-foreground" />
                        {t('form.model')}
                      </Label>
                      <Input
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="BMW X5, Tesla Model 3, Mercedes C-Class..."
                        required
                        maxLength={100}
                        className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {t('form.year')}
                        </Label>
                        <Input
                          id="year"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          placeholder="2020"
                          maxLength={4}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="color" className="text-sm font-medium flex items-center gap-2">
                          <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                          {t('form.color')}
                        </Label>
                        <Input
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          placeholder="Black, White..."
                          maxLength={50}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trim" className="text-sm font-medium flex items-center gap-2">
                          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                          {t('form.trim')}
                        </Label>
                        <Input
                          id="trim"
                          name="trim"
                          value={formData.trim}
                          onChange={handleChange}
                          placeholder="Sport, M-Package..."
                          maxLength={100}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional" className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        {t('form.additional')}
                      </Label>
                      <Textarea
                        id="additional"
                        name="additional"
                        value={formData.additional}
                        onChange={handleChange}
                        placeholder="Имате ли някакви допълнителни желания или забележки?"
                        rows={4}
                        maxLength={1000}
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full h-14 text-lg font-semibold rounded-xl group relative overflow-hidden"
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Изпращане...
                          </>
                        ) : (
                          <>
                            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {t('form.submit')}
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
