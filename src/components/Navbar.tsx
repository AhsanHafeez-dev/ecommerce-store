'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Fragment } from 'react';
import { Popover, Transition, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <Popover className="relative bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/">
              <span className="sr-only">E-commerce Store</span>
              <img
                className="h-8 w-auto sm:h-10"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt="E-commerce Store Logo"
              />
            </Link>
          </div>
          <div className="-my-2 -mr-2 md:hidden">
            <Popover.Button className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>
          <Popover.Group as="nav" className="hidden space-x-10 md:flex">
            <Link href="/products" className="text-base font-medium text-gray-500 hover:text-gray-900">Products</Link>
            <Link href="/categories" className="text-base font-medium text-gray-500 hover:text-gray-900">Categories</Link>
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className="text-base font-medium text-gray-500 hover:text-gray-900">Admin</Link>
            )}
          </Popover.Group>
          <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
            <Link href="/cart" className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900 mr-4">
                <ShoppingCartIcon className="h-6 w-6 inline-block" aria-hidden="true" />
              </Link>
            {session ? (
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user?.image || 'https://via.placeholder.com/150'}
                      alt="User Avatar"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/profile"
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block w-full text-left px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Link href="/auth/signin" className="btn-primary">
                  Sign in
                </Link>
            )}
          </div>
        </div>
      </div>

      <Transition
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel focus className="absolute inset-x-0 top-0 z-10 origin-top-right transform p-2 transition md:hidden">
          <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-5 pb-6 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                    alt="E-commerce Store Logo"
                  />
                </div>
                <div className="-mr-2">
                  <Popover.Button className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  <Link href="/products" className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50">
                      <span className="ml-3 text-base font-medium text-gray-900">Products</span>
                    </Link>
                  <Link href="/categories" className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50">
                      <span className="ml-3 text-base font-medium text-gray-900">Categories</span>
                    </Link>
                  {session?.user?.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50">
                        <span className="ml-3 text-base font-medium text-gray-900">Admin</span>
                      </Link>
                  )}
                  <Link href="/cart" className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50">
                      <span className="ml-3 text-base font-medium text-gray-900">Cart</span>
                    </Link>
                </nav>
              </div>
            </div>
            <div className="space-y-6 px-5 py-6">
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Sign out
                </button>
              ) : (
                <div className="">
                  <Link href="/auth/signin" className="btn-primary">
                      Sign in
                    </Link>
                </div>
              )}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
