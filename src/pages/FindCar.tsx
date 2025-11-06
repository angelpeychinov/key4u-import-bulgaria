import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

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
      
      // Here you would send the data to your backend
      // For now, just show a success message
      console.log("Form submitted:", validated);
      
      toast.success(t('form.success'));
      
      // Reset form
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
    <div className="min-h-screen pt-24 pb-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold mb-2">
                {t('form.title')}
              </CardTitle>
              <p className="text-muted-foreground">{t('form.subtitle')}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('form.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('form.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={255}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('form.phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">{t('form.model')}</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="BMW X5, Tesla Model 3, Mercedes C-Class..."
                    required
                    maxLength={100}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">{t('form.year')}</Label>
                    <Input
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="2020"
                      maxLength={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">{t('form.color')}</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Black, White..."
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trim">{t('form.trim')}</Label>
                    <Input
                      id="trim"
                      name="trim"
                      value={formData.trim}
                      onChange={handleChange}
                      placeholder="Sport, M-Package..."
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional">{t('form.additional')}</Label>
                  <Textarea
                    id="additional"
                    name="additional"
                    value={formData.additional}
                    onChange={handleChange}
                    placeholder="Any specific requirements or preferences..."
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : t('form.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
