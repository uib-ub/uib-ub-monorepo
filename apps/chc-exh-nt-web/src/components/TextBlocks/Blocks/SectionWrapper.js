const SectionWrapper = ({ children, ...rest }) => {
  return (
    <div {...rest}>
      {children}
    </div>
  )
}

export default SectionWrapper
