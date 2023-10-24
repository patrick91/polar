const ShadowBox = (props: {
  children: React.ReactElement | React.ReactElement[]
}) => (
  <div className="dark:bg-polar-800 dark:ring-polar-700 w-full rounded-xl bg-gray-50 p-5 shadow dark:ring-1">
    {props.children}
  </div>
)

export default ShadowBox
