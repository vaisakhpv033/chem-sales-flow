import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertCircle } from "lucide-react";

const products = [
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

const Products = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Products</h2>
        <p className="text-muted-foreground mt-1">Manage your product catalog</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
};

export default Products;
