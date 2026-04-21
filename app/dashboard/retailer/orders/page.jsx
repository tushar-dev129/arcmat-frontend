'use client';
import { useState } from 'react';
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useGetOrders } from '@/hooks/useOrder';
import Pagination from '@/components/ui/Pagination';

const STATUS_STYLES = {
    pending: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700', icon: Clock },
    processing: { label: 'Processing', cls: 'bg-blue-50 text-blue-700', icon: Truck },
    shipped: { label: 'Shipped', cls: 'bg-indigo-50 text-indigo-700', icon: Truck },
    delivered: { label: 'Delivered', cls: 'bg-green-50 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700', icon: XCircle },
};

function StatusBadge({ status }) {
    const cfg = STATUS_STYLES[status?.toLowerCase()] || { label: status || '—', cls: 'bg-gray-100 text-gray-600', icon: Clock };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

export default function RetailerOrdersPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    const { data: ordersData, isLoading } = useGetOrders({ page: currentPage, limit: pageSize });

    const orders = ordersData?.data?.data || ordersData?.data || [];
    const pagination = ordersData?.data?.pagination;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-500 text-sm mt-1">Track and manage your orders.</p>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex gap-4">
                            <div className="h-12 w-12 bg-gray-100 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-1/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-200">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-500 font-medium">No orders yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Your orders will appear here once you place them.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                    <th className="px-5 py-3 text-left">Order ID</th>
                                    <th className="px-5 py-3 text-left">Items</th>
                                    <th className="px-5 py-3 text-left">Total</th>
                                    <th className="px-5 py-3 text-left">Status</th>
                                    <th className="px-5 py-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map(order => (
                                    <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs text-gray-700">
                                            #{(order._id || order.id)?.toString().slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">
                                            {order.items?.length || order.products?.length || '—'} item{(order.items?.length || order.products?.length) !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-5 py-3 font-semibold text-gray-900">
                                            ₹{(order.totalAmount || order.total || 0).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 text-xs">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {pagination?.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page || 1}
                    totalPages={pagination.totalPages}
                    pageSize={pageSize}
                    totalItems={pagination.total}
                    onPageChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    onPageSizeChange={s => { setPageSize(s); setCurrentPage(1); }}
                />
            )}
        </div>
    );
}
