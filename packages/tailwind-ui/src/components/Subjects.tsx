import React from "react";

export const Subjects = ({ value, language }: any) => {

  return (
    <div className='flex flex-wrap gap-1'>
      {value.map((i: any) => (
        <div key={i._id} className={`text-xs font-light bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-sm dark:shadow-xl`}>
          {i.label[language] ?? 'Missing label'}
        </div>
      ))}
    </div>
  )
}