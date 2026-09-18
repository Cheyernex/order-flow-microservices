import { Icon } from '@iconify/react';
import { Link } from 'react-router';

const FullLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 py-2 text-decoration-none">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary/30">
        <Icon icon="solar:bolt-circle-bold-duotone" width={24} />
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-1">
          Order<span className="text-primary">Flow</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
          MICROSERVICES
        </span>
      </div>
    </Link>
  );
};

export default FullLogo;
