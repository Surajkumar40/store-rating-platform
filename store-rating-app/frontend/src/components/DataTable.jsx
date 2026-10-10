import { Empty, Icon, Skeleton } from './ui.jsx';

// columns: [{ key, label, sortable, render? }]. Sorting is controlled by the parent.
export default function DataTable({ columns, rows, sort, onSort, loading, reloading, emptyTitle = 'Nothing here yet', emptyText, emptyAction, rowKey = 'id' }) {
  if (!loading && !rows.length) return <Empty title={emptyTitle} action={emptyAction}>{emptyText}</Empty>;
  return (
    <div className={`shadow-card overflow-x-auto rounded-xl border border-line bg-surface transition-opacity ${reloading ? 'opacity-60' : ''}`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-bg/60">
          <tr>
            {columns.map((c) => {
              const active = sort.key === c.key;
              return (
                <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {c.sortable ? (
                    <button type="button" onClick={() => onSort(c.key)} className="group inline-flex items-center gap-1.5 hover:text-brand">
                      {c.label}
                      <Icon name={active && sort.dir === 'desc' ? 'sortDown' : 'sortUp'} className={`h-3.5 w-3.5 ${active ? 'text-brand' : 'text-line group-hover:text-muted'}`} />
                    </button>
                  ) : c.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {columns.map((c) => <td key={c.key} className="px-4 py-4"><Skeleton className="h-4 w-4/5" /></td>)}
                </tr>
              ))
            : rows.map((r) => (
                <tr key={r[rowKey]} className="border-b border-line transition-colors last:border-0 hover:bg-bg/60">
                  {columns.map((c) => <td key={c.key} className="px-4 py-3 align-middle">{c.render ? c.render(r) : r[c.key]}</td>)}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
