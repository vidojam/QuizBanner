export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-auto" data-testid="footer">
      <p>© {currentYear} Jose A Torres. All rights reserved.</p>
    </footer>
  );
}
