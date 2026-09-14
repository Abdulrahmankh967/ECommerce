import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Truck,
  Search,
  Filter,
  Edit2,
  Calendar,
  X,
  AlertCircle,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Shipment, UpdateShipmentRequest, OrderDetail } from '../../types/api.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminShipmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingShipment, setEditingShipment] = useState<{ id: number; orderId: number; shipment: Shipment | null } | null>(null);
  const [formError, setFormError] = useState<string>('');

  // Fetch orders so we can view shipments associated with each order
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminApi.getAllOrders,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateShipmentRequest }) =>
      adminApi.updateShipmentStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setEditingShipment(null);
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to update shipment status.');
    },
  });

  const filteredOrders = orders.filter((o) =>
    String(o.id).includes(searchTerm) ||
    (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shipments & Logistics</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track packages, assign courier tracking numbers, and update fulfillment milestones.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
          {filteredOrders.length} orders tracked
        </span>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loadingOrders ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-slate-500">Loading shipment records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No shipments found</h3>
            <p className="text-xs text-slate-400 mt-1">Shipment records will appear once orders are placed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Destination</th>
                  <th className="py-3.5 px-6">Shipment Status</th>
                  <th className="py-3.5 px-6">Order Placed</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <OrderShipmentRow
                    key={order.id}
                    order={order}
                    onEditShipment={(shipment) => {
                      setFormError('');
                      setEditingShipment({
                        id: shipment?.id || order.id,
                        orderId: order.id,
                        shipment,
                      });
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Shipment Modal */}
      {editingShipment && (
        <ShipmentEditModal
          orderId={editingShipment.orderId}
          shipment={editingShipment.shipment}
          isLoading={updateMutation.isPending}
          errorMessage={formError}
          onClose={() => setEditingShipment(null)}
          onSubmit={(data) => {
            updateMutation.mutate({
              id: editingShipment.shipment?.id || editingShipment.id,
              data,
            });
          }}
        />
      )}
    </div>
  );
};

// Row component that queries shipment for each order
const OrderShipmentRow: React.FC<{
  order: OrderDetail;
  onEditShipment: (shipment: Shipment | null) => void;
}> = ({ order, onEditShipment }) => {
  const { data: shipment, isLoading } = useQuery({
    queryKey: ['order-shipment', order.id],
    queryFn: () => adminApi.getShipmentByOrderId(order.id),
  });

  const city = order.shippingAddress?.shippingCity || 'Default Address';
  const recipient = order.shippingAddress?.shippingRecipientName || order.customerName || 'Customer';

  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      <td className="py-4 px-6 font-mono font-bold text-slate-900">
        #{order.id}
      </td>
      <td className="py-4 px-6">
        <div>
          <p className="font-semibold text-slate-800">{recipient}</p>
          <span className="text-[11px] text-slate-400">ID #{order.customerId}</span>
        </div>
      </td>
      <td className="py-4 px-6 text-xs text-slate-600">
        {city}
      </td>
      <td className="py-4 px-6">
        {isLoading ? (
          <Spinner size="sm" />
        ) : shipment ? (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              shipment.status?.toLowerCase() === 'delivered'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : shipment.status?.toLowerCase() === 'shipped'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {shipment.status?.toLowerCase() === 'delivered' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            {shipment.status}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
            Pending Dispatch
          </span>
        )}
      </td>
      <td className="py-4 px-6 text-xs text-slate-500">
        {new Date(order.orderDate).toLocaleDateString()}
      </td>
      <td className="py-4 px-6 text-right">
        <button
          onClick={() => onEditShipment(shipment || null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Update Status
        </button>
      </td>
    </tr>
  );
};

// Modal to update shipment status
const ShipmentEditModal: React.FC<{
  orderId: number;
  shipment: Shipment | null;
  isLoading: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (data: UpdateShipmentRequest) => void;
}> = ({ orderId, shipment, isLoading, errorMessage, onClose, onSubmit }) => {
  const [status, setStatus] = useState(shipment?.status || 'Shipped');
  const [carrier, setCarrier] = useState(shipment?.carrier || '');
  const [trackingNumber, setTrackingNumber] = useState(shipment?.trackingNumber || '');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(
    shipment?.estimatedDeliveryDate ? shipment.estimatedDeliveryDate.split('T')[0] : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      status,
      carrier: carrier.trim() || null,
      trackingNumber: trackingNumber.trim() || null,
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toISOString() : null,
      shipmentDate: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Update Shipment for Order #{orderId}</h3>
            <p className="text-xs text-slate-400">Manage dispatch, carrier info, and tracking number</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shipment Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Courier / Carrier</label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. DHL, FedEx"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 1Z99999999"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Delivery Date</label>
            <input
              type="date"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              {isLoading ? <Spinner size="sm" /> : 'Save Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminShipmentsPage;
