"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, CreditCard, Calendar, DollarSign, FileText, Clock, Search, ChevronDown, ExternalLink } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Filter from "lucide-react/dist/esm/icons/filter";
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock billing record interface - in real app this would come from Stripe
interface BillingRecord {
  id: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
  paymentMethod: {
    type: 'card' | 'bank' | 'paypal';
    last4?: string;
    brand?: string;
  };
  period?: {
    start: Date;
    end: Date;
  };
}

interface BillingHistoryProps {
  records: BillingRecord[];
  onDownloadInvoice?: (recordId: string) => void;
  onViewInvoice?: (recordId: string) => void;
  loading?: boolean;
  className?: string;
}

export function BillingHistory({
  records,
  onDownloadInvoice,
  onViewInvoice,
  loading = false,
  className
}: BillingHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort records
  const filteredRecords = records
    .filter(record => {
      const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return (a.date.getTime() - b.date.getTime()) * multiplier;
      } else {
        return (a.amount - b.amount) * multiplier;
      }
    });

  const getStatusIcon = (status: BillingRecord['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'refunded':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: BillingRecord['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-300 border-green-400/20';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/20';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-400/20';
      case 'refunded':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/20';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/20';
    }
  };

  const getPaymentMethodIcon = (type: BillingRecord['paymentMethod']['type']) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'bank':
        return <DollarSign className="w-4 h-4" />;
      case 'paypal':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card variant="glass" className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Billing History
          </CardTitle>
          
          <div className="text-sm text-white/60">
            {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                sortOrder === 'asc' && "rotate-180"
              )} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No billing records found
            </h3>
            <p className="text-white/60">
              {records.length === 0 
                ? "You don't have any billing history yet."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className="font-medium text-white">
                          {record.description}
                        </span>
                      </div>
                      
                      <Badge className={cn("text-xs", getStatusColor(record.status))}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.date)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(record.paymentMethod.type)}
                        <span>
                          {record.paymentMethod.brand && record.paymentMethod.last4
                            ? `${record.paymentMethod.brand} •••• ${record.paymentMethod.last4}`
                            : record.paymentMethod.type.charAt(0).toUpperCase() + record.paymentMethod.type.slice(1)
                          }
                        </span>
                      </div>

                      {record.period && (
                        <div className="text-xs">
                          Service period: {formatDate(record.period.start)} - {formatDate(record.period.end)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {formatAmount(record.amount, record.currency)}
                      </div>
                      <div className="text-xs text-white/60">
                        {record.currency.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {record.invoiceUrl && onViewInvoice && (
                        <Button
                          onClick={() => onViewInvoice(record.id)}
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}

                      {onDownloadInvoice && record.status === 'paid' && (
                        <Button
                          onClick={() => onDownloadInvoice(record.id)}
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button - if needed for pagination */}
        {filteredRecords.length > 0 && filteredRecords.length % 10 === 0 && (
          <div className="text-center mt-6">
            <Button variant="outline" className="text-white/60 hover:text-white">
              Load More Records
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}