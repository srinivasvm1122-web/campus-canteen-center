import React from 'react';
import { Clock, Users, Flame, AlertCircle, CheckCircle2, Ticket } from 'lucide-react';
import { IOrder } from '../../types.ts';

interface QueueSlotBreakdownProps {
  orders: IOrder[];
}

export const QueueSlotBreakdown: React.FC<QueueSlotBreakdownProps> = ({ orders }) => {
  const activeOrders = orders.filter(
    o => o.orderStatus !== 'COLLECTED' && o.orderStatus !== 'CANCELLED'
  );

  const degreeSlots = [
    '1:00 PM – 1:10 PM',
    '1:10 PM – 1:20 PM',
    '1:20 PM – 1:30 PM',
  ];

  const mastersSlots = [
    '1:30 PM – 1:40 PM',
    '1:40 PM – 1:50 PM',
    '1:50 PM – 2:00 PM',
  ];

  const getSlotOrders = (slot: string) => {
    return activeOrders.filter(o => o.pickupSlot === slot);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Waiting Students
            </span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">
              {activeOrders.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Active Queue Tokens
            </span>
            <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
              {activeOrders.length === 0 ? (
                <span className="text-xs text-slate-400">Queue clear</span>
              ) : (
                activeOrders.slice(0, 6).map(o => (
                  <span
                    key={o._id}
                    className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded"
                  >
                    #{o.tokenNumber}
                  </span>
                ))
              )}
              {activeOrders.length > 6 && (
                <span className="text-xs text-slate-400">+{activeOrders.length - 6} more</span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Peak Traffic Slot
            </span>
            <span className="text-sm font-black text-slate-900 mt-1 block">
              1:10 PM – 1:20 PM
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">High Lunch Rush</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Degree Slots Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-700" />
            <h3 className="font-extrabold text-base text-slate-900">
              Degree Students Queue Distribution (1:00 PM – 1:30 PM)
            </h3>
          </div>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
            Window 1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {degreeSlots.map(slot => {
            const slotOrders = getSlotOrders(slot);
            const count = slotOrders.length;
            const isHigh = count >= 8;

            return (
              <div
                key={slot}
                className={`p-4 rounded-2xl border transition-all ${
                  isHigh ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{slot}</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {count} <span className="text-xs font-normal text-slate-500">orders</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-amber-200 text-amber-900'
                        : count > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isHigh ? 'Heavy Rush' : count > 0 ? 'Active' : 'No Crowd'}
                  </span>
                </div>

                {/* Tokens in slot */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1">
                  {slotOrders.map(o => (
                    <span
                      key={o._id}
                      className="text-[11px] font-bold bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded-md"
                    >
                      #{o.tokenNumber}
                    </span>
                  ))}
                  {count === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No scheduled pickups</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master's Slots Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-700" />
            <h3 className="font-extrabold text-base text-slate-900">
              Master's Students Queue Distribution (1:30 PM – 2:00 PM)
            </h3>
          </div>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
            Window 2
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mastersSlots.map(slot => {
            const slotOrders = getSlotOrders(slot);
            const count = slotOrders.length;
            const isHigh = count >= 8;

            return (
              <div
                key={slot}
                className={`p-4 rounded-2xl border transition-all ${
                  isHigh ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{slot}</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {count} <span className="text-xs font-normal text-slate-500">orders</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-amber-200 text-amber-900'
                        : count > 0
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isHigh ? 'Heavy Rush' : count > 0 ? 'Active' : 'No Crowd'}
                  </span>
                </div>

                {/* Tokens in slot */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1">
                  {slotOrders.map(o => (
                    <span
                      key={o._id}
                      className="text-[11px] font-bold bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded-md"
                    >
                      #{o.tokenNumber}
                    </span>
                  ))}
                  {count === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No scheduled pickups</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
