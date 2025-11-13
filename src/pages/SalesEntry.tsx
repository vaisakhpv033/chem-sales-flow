import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const products = [
  "Chemical A-301",
  "Chemical B-205",
  "Chemical C-102",
  "Chemical D-450",
  "Chemical E-789",
];

const distributors = [
  "Alpha Distributors Ltd",
  "Beta Trading Co",
  "Gamma Chemicals Pvt Ltd",
  "Delta Supply Chain",
  "Epsilon Distribution",
];

const SalesEntry = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    distributor: "",
    product: "",
    quantity: "",
    unitPrice: "",
    totalAmount: "",
    invoiceNumber: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !formData.distributor || !formData.product || !formData.quantity || !formData.unitPrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sales Entry Submitted",
      description: "The sales data has been recorded successfully",
    });

    // Reset form
    setFormData({
      distributor: "",
      product: "",
      quantity: "",
      unitPrice: "",
      totalAmount: "",
      invoiceNumber: "",
      notes: "",
    });
    setDate(undefined);
  };

  const calculateTotal = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const handleQuantityChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      quantity: value,
      totalAmount: calculateTotal(value, prev.unitPrice),
    }));
  };

  const handlePriceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      unitPrice: value,
      totalAmount: calculateTotal(prev.quantity, value),
    }));
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Sales Entry</h2>
        <p className="text-muted-foreground mt-1">Record new secondary sales transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Sales Transaction</CardTitle>
          <CardDescription>Enter the details of the sales made by distributor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distributor">Distributor *</Label>
                <Select
                  value={formData.distributor}
                  onValueChange={(value) => setFormData({ ...formData, distributor: value })}
                >
                  <SelectTrigger id="distributor">
                    <SelectValue placeholder="Select distributor" />
                  </SelectTrigger>
                  <SelectContent>
                    {distributors.map((dist) => (
                      <SelectItem key={dist} value={dist}>
                        {dist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Sale Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={formData.product}
                  onValueChange={(value) => setFormData({ ...formData, product: value })}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  placeholder="INV-2024-001"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Units) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.unitPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount ($)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalAmount}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or comments..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Submit Sales Entry
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    distributor: "",
                    product: "",
                    quantity: "",
                    unitPrice: "",
                    totalAmount: "",
                    invoiceNumber: "",
                    notes: "",
                  });
                  setDate(undefined);
                }}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesEntry;
