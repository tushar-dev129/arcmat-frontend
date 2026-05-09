import clsx from 'clsx';

export default function StatusBadge({ status, type = 'default' }) {
  const variants = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    'out-of-stock': 'bg-red-100 text-red-800',
    'in-stock': 'bg-green-100 text-green-800',
    hidden: 'bg-yellow-100 text-yellow-800',
    flagged: 'bg-red-100 text-red-800',
    // Lead statuses
    new: 'bg-blue-100 text-blue-800',
    reviewed: 'bg-purple-100 text-purple-800',
    contacted: 'bg-amber-100 text-amber-800',
    quoted: 'bg-indigo-100 text-indigo-800',
    closed: 'bg-emerald-100 text-emerald-800',
    spam: 'bg-rose-100 text-rose-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[status] || variants.default
      )}
    >
      {status}
    </span>
  );
}