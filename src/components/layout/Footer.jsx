const Footer = () => {
  return (
    <footer className="h-10 bg-white border-t border-gray-200 flex items-center justify-center shrink-0">
      <p className="text-xs text-gray-400">
        © {new Date().getFullYear()} HSE System — Health, Safety & Environment
      </p>
    </footer>
  );
};

export default Footer;