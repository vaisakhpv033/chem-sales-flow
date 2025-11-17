import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, AlertCircle, Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  unitPrice: number;
  stock: string;
  monthlySales: number;
  trend: number;
};

const productFormSchema = z.object({
  name: z.string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-]+$/, "Product name can only contain letters, numbers, spaces, and hyphens"),
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Category can only contain letters and spaces"),
  sku: z.string()
    .min(1, "SKU is required")
    .regex(/^CHM-[A-Z0-9]{3,10}$/, "SKU must follow format: CHM-XXX (e.g., CHM-A301)")
    .max(20, "SKU must be less than 20 characters"),
  unitPrice: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Unit price must be a positive number greater than 0"
    })
    .refine((val) => parseFloat(val) <= 100000, {
      message: "Unit price must be less than $100,000"
    }),
  stock: z.enum(["In Stock", "Low Stock", "Out of Stock"], {
    required_error: "Stock status is required"
  }),
  monthlySales: z.string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: "Monthly sales must be a non-negative number"
    })
    .refine((val) => parseInt(val) <= 1000000, {
      message: "Monthly sales must be less than 1,000,000 units"
    }),
  trend: z.string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Trend must be a valid number"
    })
    .refine((val) => parseFloat(val) >= -100 && parseFloat(val) <= 100, {
      message: "Trend must be between -100% and +100%"
    })
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Chemical A-301",
    category: "Industrial Solvents",
    sku: "CHM-A301",
    unitPrice: 450,
    stock: "In Stock",
    monthlySales: 2450,
    trend: 12.5,
  },
  {
    id: "2",
    name: "Chemical B-205",
    category: "Catalysts",
    sku: "CHM-B205",
    unitPrice: 380,
    stock: "In Stock",
    monthlySales: 1980,
    trend: 8.3,
  },
  {
    id: "3",
    name: "Chemical C-102",
    category: "Additives",
    sku: "CHM-C102",
    unitPrice: 520,
    stock: "Low Stock",
    monthlySales: 1450,
    trend: -2.1,
  },
  {
    id: "4",
    name: "Chemical D-450",
    category: "Polymers",
    sku: "CHM-D450",
    unitPrice: 410,
    stock: "In Stock",
    monthlySales: 1820,
    trend: 15.7,
  },
  {
    id: "5",
    name: "Chemical E-789",
    category: "Specialty Chemicals",
    sku: "CHM-E789",
    unitPrice: 680,
    stock: "In Stock",
    monthlySales: 1120,
    trend: 6.4,
  },
];

const ITEMS_PER_PAGE = 6;

const Products = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      sku: "",
      unitPrice: "",
      stock: "In Stock",
      monthlySales: "",
      trend: "",
    },
  });

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return ["all", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        category: product.category,
        sku: product.sku,
        unitPrice: product.unitPrice.toString(),
        stock: product.stock as "In Stock" | "Low Stock" | "Out of Stock",
        monthlySales: product.monthlySales.toString(),
        trend: product.trend.toString(),
      });
    } else {
      setEditingProduct(null);
      form.reset({
        name: "",
        category: "",
        sku: "",
        unitPrice: "",
        stock: "In Stock",
        monthlySales: "",
        trend: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (values: ProductFormValues) => {
    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: values.name,
      category: values.category,
      sku: values.sku,
      unitPrice: parseFloat(values.unitPrice),
      stock: values.stock,
      monthlySales: parseInt(values.monthlySales),
      trend: parseFloat(values.trend),
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      toast({
        title: "Product updated",
        description: "Product has been updated successfully.",
      });
    } else {
      setProducts([...products, newProduct]);
      toast({
        title: "Product added",
        description: "New product has been added successfully.",
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingProductId) {
      setProducts(products.filter(p => p.id !== deletingProductId));
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setDeletingProductId(null);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setDisplayCount(ITEMS_PER_PAGE);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value);
                setDisplayCount(ITEMS_PER_PAGE);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {filteredProducts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {displayedProducts.length} of {filteredProducts.length} products
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Summary</CardTitle>
          <CardDescription>Overview of product performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Products</div>
              <div className="text-3xl font-bold">{products.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Average Price</div>
              <div className="text-3xl font-bold">
                ${Math.round(products.reduce((sum, p) => sum + p.unitPrice, 0) / products.length)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Monthly Sales</div>
              <div className="text-3xl font-bold">
                {products.reduce((sum, p) => sum + p.monthlySales, 0).toLocaleString()} units
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={product.stock === "In Stock" ? "default" : "secondary"}
                    className={product.stock === "In Stock" 
                      ? "bg-success text-success-foreground" 
                      : "bg-warning text-warning-foreground"
                    }
                  >
                    {product.stock === "In Stock" ? (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-success-foreground"></span>
                        {product.stock}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {product.stock}
                      </span>
                    )}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription className="mt-1">{product.category}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Price:</span>
                  <span className="font-medium">${product.unitPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Sales:</span>
                  <span className="font-medium">{product.monthlySales} units</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Trend:</span>
                  <span className={`flex items-center gap-1 font-medium ${
                    product.trend > 0 ? "text-success" : "text-destructive"
                  }`}>
                    <TrendingUp className={`h-4 w-4 ${product.trend < 0 ? "rotate-180" : ""}`} />
                    {product.trend > 0 ? "+" : ""}{product.trend}%
                  </span>
                </div>
                <div className="flex gap-2 pt-3 mt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setDeletingProductId(product.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleLoadMore} variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details below." : "Enter product details below."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chemical A-301" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Industrial Solvents" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="CHM-A301" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="450" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="In Stock">In Stock</SelectItem>
                          <SelectItem value="Low Stock">Low Stock</SelectItem>
                          <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthlySales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Sales (units)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2450" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="trend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trend (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="12.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProductId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
