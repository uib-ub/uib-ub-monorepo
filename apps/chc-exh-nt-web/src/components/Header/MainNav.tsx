import { Dialog, Transition } from '@headlessui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import React, { Fragment, useState } from 'react';
import { NavLink } from 'tailwind-ui';

type MainNavProps = {
  buttonLabel: string | React.ReactNode
  title: string
  description?: string
  accessKey?: string
  value: ToC
}

export interface Label {
  _type: string;
  en: string;
  no: string;
}
export interface Target {
  _id: string;
  label: Label;
  route: string;
}

export interface Link {
  _key: string;
  _type: string;
  children?: any;
  target: Target;
}
export interface Section {
  _key: string;
  _type: string;
  label: Label;
  links: Link[];
  target: Target;
}

export interface ToC {
  _createdAt: Date;
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt: Date;
  label: Label;
  sections: Section[];
}


export const MainNav: React.FC<MainNavProps> = ({ buttonLabel, title, description, accessKey, value }) => {
  let [isOpen, setIsOpen] = useState(false)
  const { locale } = useRouter()
  const t = useTranslations('Nav');

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        accessKey={accessKey}
        onClick={openModal}
        className="rounded-md text-xs"
      >
        {buttonLabel}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 dark:bg-white-20" />
          </Transition.Child>


          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-5/6 transform overflow-hidden rounded-xl dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                  <div className='flex justify-between gap-5 mb-3'>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6"
                    >
                      {title}
                    </Dialog.Title>
                    <button className='px-3 py-1 border-2' onClick={closeModal}>{t('close')}</button>
                  </div>
                  {description ? (
                    <Dialog.Description
                      className="text-md font-medium leading-6 "
                    >
                      {description}
                    </Dialog.Description>
                  ) : null}
                  <ul className='gap-5 text-lg dark:text-neutral-300 text-neutral-700 p-5'>
                    {value?.sections && value?.sections.map((section: any, index: number) => (
                      <React.Fragment key={section._key}>
                        {section?.label ?
                          <li key={section._key} className='border-b text-md font-light first:mt-0 mt-4'>
                            {section?.label?.[locale || ''] || section?.target?.label?.[locale || '']}
                          </li>
                          : null
                        }
                        {section?.target ?
                          <li key={section._key} className='text-md font-light first:mt-0 mt-4'>
                            <NavLink href={`/${section?.target?.route}`}>
                              <span onClick={closeModal}>{section?.target?.label?.[locale || '']}</span>
                            </NavLink>
                          </li>
                          : null
                        }
                        <ul>
                          {section?.links && section?.links.map((link: any) => (
                            <li key={link._key} className='mt-1 pl-4'>
                              <NavLink href={`/${link?.target?.route}`}>
                                <span onClick={closeModal}>{link?.label?.[locale || ''] || link?.target?.label?.[locale || '']}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </React.Fragment>
                    ))}
                  </ul>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}


/* 
export const Modal: React.FC<ModalProps> = ({ buttonLabel, title, description, accessKey, children }) => {

  return (
    <>
      <button
        type="button"
        accessKey={accessKey}
        onClick={openModal}
        className="rounded-md text-xs"
      >
        {buttonLabel}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 dark:bg-neutral-900 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-5/6 transform overflow-hidden rounded-xl dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                  <div className='flex justify-between gap-5 mb-3'>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6"
                    >
                      {title}
                    </Dialog.Title>
                    <button className='px-3 py-1 border-2' onClick={closeModal}>Close</button>
                  </div>
                  {description ? (
                    <Dialog.Description
                      className="text-md font-medium leading-6 "
                    >
                      {description}
                    </Dialog.Description>
                  ) : null}
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
 */