import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Download, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const salesData = [
  {
    id: "1",
    date: "2024-01-15",
    distributor: "Alpha Distributors Ltd",
    product: "Chemical A-301",
    quantity: 150,
    unitPrice: 450,
    totalAmount: 67500,
    invoice: "INV-2024-001",
    status: "completed",
  },
  {
    id: "2",
    date: "2024-01-16",
    distributor: "Beta Trading Co",
    product: "Chemical B-205",
    quantity: 200,
    unitPrice: 380,
    totalAmount: 76000,
    invoice: "INV-2024-002",
    status: "completed",
  },
  {
    id: "3",
    date: "2024-01-17",
    distributor: "Gamma Chemicals Pvt Ltd",
    product: "Chemical C-102",
    quantity: 120,
    unitPrice: 520,
    totalAmount: 62400,
    invoice: "INV-2024-003",
    status: "pending",
  },
  {
    id: "4",
    date: "2024-01-18",
    distributor: "Delta Supply Chain",
    product: "Chemical D-450",
    quantity: 180,
    unitPrice: 410,
    totalAmount: 73800,
    invoice: "INV-2024-004",
    status: "completed",
  },
  {
    id: "5",
    date: "2024-01-19",
    distributor: "Epsilon Distribution",
    product: "Chemical E-789",
    quantity: 95,
    unitPrice: 680,
    totalAmount: 64600,
    invoice: "INV-2024-005",
    status: "completed",
  },
];

const SalesData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const filteredData = salesData.filter((sale) => {
    const matchesSearch = 
      sale.distributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoice.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    const matchesProduct = productFilter === "all" || sale.product === productFilter;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    }
    return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
  };

  const handleExport = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    // Filter data by date range
    const exportData = filteredData.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    if (exportData.length === 0) {
      toast({
        title: "No data",
        description: "No sales data found in the selected date range",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["Date", "Invoice", "Distributor", "Product", "Quantity", "Unit Price", "Total Amount", "Status"];
    const csvContent = [
      headers.join(","),
      ...exportData.map((sale) =>
        [
          sale.date,
          sale.invoice,
          `"${sale.distributor}"`,
          `"${sale.product}"`,
          sale.quantity,
          sale.unitPrice,
          sale.totalAmount,
          sale.status,
        ].join(",")
      ),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales-data-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `Exported ${exportData.length} sales records`,
    });

    setExportDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Sales Data</h2>
        <p className="text-muted-foreground mt-1">View and manage all secondary sales transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>Complete list of all recorded sales</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by distributor, product, or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="Chemical A-301">Chemical A-301</SelectItem>
                <SelectItem value="Chemical B-205">Chemical B-205</SelectItem>
                <SelectItem value="Chemical C-102">Chemical C-102</SelectItem>
                <SelectItem value="Chemical D-450">Chemical D-450</SelectItem>
                <SelectItem value="Chemical E-789">Chemical E-789</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full md:w-auto" onClick={() => setExportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Distributor</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No sales data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.date}</TableCell>
                      <TableCell>{sale.invoice}</TableCell>
                      <TableCell>{sale.distributor}</TableCell>
                      <TableCell>{sale.product}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">${sale.unitPrice}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${sale.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
            <div>
              Showing {filteredData.length} of {salesData.length} transactions
            </div>
            <div className="flex gap-6">
              <div>
                <span className="font-medium text-foreground">Total Units:</span>{" "}
                {filteredData.reduce((sum, sale) => sum + sale.quantity, 0)}
              </div>
              <div>
                <span className="font-medium text-foreground">Total Amount:</span> $
                {filteredData.reduce((sum, sale) => sum + sale.totalAmount, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Sales Data</DialogTitle>
            <DialogDescription>
              Select a date range to export sales transactions as CSV
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesData;
