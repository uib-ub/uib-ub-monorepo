import React from "react";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

type ModalProps = {
  buttonLabel: string | React.ReactNode
  title: string
  description?: string
  accessKey?: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ buttonLabel, title, description, accessKey, children }) => {
  let [isOpen, setIsOpen] = useState(false)

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
