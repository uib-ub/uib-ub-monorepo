const SectionWrapper = ({ children, ...rest }: any) => {
  return (
    <div {...rest}>
      {children}
    </div>
  )
}

export default SectionWrapper
