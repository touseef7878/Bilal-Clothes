'use client';

import { Shirt, Ruler, User, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const menSizes = [
  { size: 'S', chest: '38', waist: '32', shoulder: '17.5', length: '38', sleeve: '23' },
  { size: 'M', chest: '40', waist: '34', shoulder: '18', length: '39', sleeve: '23.5' },
  { size: 'L', chest: '42', waist: '36', shoulder: '18.5', length: '40', sleeve: '24' },
  { size: 'XL', chest: '44', waist: '38', shoulder: '19', length: '41', sleeve: '24.5' },
  { size: 'XXL', chest: '46', waist: '40', shoulder: '19.5', length: '42', sleeve: '25' },
];

const womenSizes = [
  { size: 'XS', bust: '32', waist: '26', hip: '35', kameezLength: '36', shoulder: '14' },
  { size: 'S', bust: '34', waist: '28', hip: '37', kameezLength: '37', shoulder: '14.5' },
  { size: 'M', bust: '36', waist: '30', hip: '39', kameezLength: '38', shoulder: '15' },
  { size: 'L', bust: '38', waist: '32', hip: '41', kameezLength: '39', shoulder: '15.5' },
  { size: 'XL', bust: '40', waist: '34', hip: '43', kameezLength: '40', shoulder: '16' },
  { size: 'XXL', bust: '42', waist: '36', hip: '45', kameezLength: '41', shoulder: '16.5' },
];

const measurementTips = [
  {
    title: 'Chest / Bust',
    description: 'Measure around the fullest part of your chest/bust, keeping the tape level under the arms.',
  },
  {
    title: 'Waist',
    description: 'Measure around your natural waistline, keeping the tape comfortably loose.',
  },
  {
    title: 'Hips',
    description: 'Stand with feet together and measure around the fullest part of your hips.',
  },
  {
    title: 'Kameez Length',
    description: 'Measure from the highest point of your shoulder down to the desired hem length.',
  },
  {
    title: 'Shoulder',
    description: 'Measure from the edge of one shoulder to the other, across the back.',
  },
  {
    title: 'Sleeve Length',
    description: 'Measure from the shoulder seam to the wrist, with arm slightly bent.',
  },
];

export default function SizeGuidePage() {
  return (
    <div className="container-narrow py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Ruler className="h-4 w-4" />
          Size Guide
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-balance">
          Find Your Perfect Fit
        </h1>
        <p className="text-lg text-muted-foreground text-balance">
          We want every Bilal Clothes piece to fit you just right. Use our size charts below to find your
          perfect size. All measurements are in inches.
        </p>
      </div>

      {/* Size Charts */}
      <Tabs defaultValue="men" className="mb-16">
        <div className="flex justify-center mb-8">
          <TabsList className="h-12">
            <TabsTrigger value="men" className="px-6 text-base">
              <User className="h-4 w-4 mr-2" />
              Men
            </TabsTrigger>
            <TabsTrigger value="women" className="px-6 text-base">
              <Shirt className="h-4 w-4 mr-2" />
              Women
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Men's Size Chart */}
        <TabsContent value="men">
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="p-6 border-b">
              <h2 className="font-display text-xl font-bold mb-1">Men&apos;s Size Chart</h2>
              <p className="text-sm text-muted-foreground">
                Measurements for shalwar kameez, kurtas, and formal wear. All values in inches.
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Size</TableHead>
                  <TableHead className="font-semibold">Chest</TableHead>
                  <TableHead className="font-semibold">Waist</TableHead>
                  <TableHead className="font-semibold">Shoulder</TableHead>
                  <TableHead className="font-semibold">Length</TableHead>
                  <TableHead className="font-semibold">Sleeve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menSizes.map((row) => (
                  <TableRow key={row.size}>
                    <TableCell className="font-semibold text-primary">{row.size}</TableCell>
                    <TableCell>{row.chest}&quot;</TableCell>
                    <TableCell>{row.waist}&quot;</TableCell>
                    <TableCell>{row.shoulder}&quot;</TableCell>
                    <TableCell>{row.length}&quot;</TableCell>
                    <TableCell>{row.sleeve}&quot;</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Women's Size Chart */}
        <TabsContent value="women">
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="p-6 border-b">
              <h2 className="font-display text-xl font-bold mb-1">Women&apos;s Size Chart</h2>
              <p className="text-sm text-muted-foreground">
                Measurements for lawn suits, kurtis, and formal wear. All values in inches.
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Size</TableHead>
                  <TableHead className="font-semibold">Bust</TableHead>
                  <TableHead className="font-semibold">Waist</TableHead>
                  <TableHead className="font-semibold">Hip</TableHead>
                  <TableHead className="font-semibold">Kameez Length</TableHead>
                  <TableHead className="font-semibold">Shoulder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {womenSizes.map((row) => (
                  <TableRow key={row.size}>
                    <TableCell className="font-semibold text-primary">{row.size}</TableCell>
                    <TableCell>{row.bust}&quot;</TableCell>
                    <TableCell>{row.waist}&quot;</TableCell>
                    <TableCell>{row.hip}&quot;</TableCell>
                    <TableCell>{row.kameezLength}&quot;</TableCell>
                    <TableCell>{row.shoulder}&quot;</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* How to Measure */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold mb-3">How to Measure</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Grab a soft measuring tape and follow these simple steps for accurate measurements.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {measurementTips.map((tip, index) => (
            <div key={tip.title} className="border rounded-xl p-6 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="font-display text-base font-semibold">{tip.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-11">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="border border-primary/20 bg-primary/5 rounded-xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold mb-1">Need Help with Sizing?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Still unsure about your size? Message us on WhatsApp at{' '}
            <a
              href="https://wa.me/923101533429"
              className="text-primary font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              +92 310 1533429
            </a>{' '}
            with your measurements and we&apos;ll help you pick the perfect fit. We also offer free
            alterations on kameez length within 7 days of delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
