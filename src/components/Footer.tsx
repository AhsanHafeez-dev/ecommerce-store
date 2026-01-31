export default function Footer() {
  return (
    <footer className="bg-white shadow-md mt-auto py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">&copy; {new Date().getFullYear()} E-commerce Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
