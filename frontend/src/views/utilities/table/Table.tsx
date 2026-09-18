import TableComp from 'src/components/utilities/table';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import StripedRowTable from 'src/components/utilities/table/StripedRowTable';
import HoverTable from 'src/components/utilities/table/HoverTable';
import CheckboxTable from 'src/components/utilities/table/CheckboxTable';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { EmployeesData } from 'src/components/utilities/table/data';
const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Table',
  },
];
const Notes = () => {
  return (
    <>
      <BreadcrumbComp title="Table" items={BCrumb} />
      <div className="flex gap-6 flex-col ">
        <DataTable data={EmployeesData} />
        <TableComp />
        <StripedRowTable />
        <HoverTable />
        <CheckboxTable />
      </div>
    </>
  );
};

export default Notes;
