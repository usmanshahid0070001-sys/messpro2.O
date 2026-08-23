import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import ComplainManagement from './ComplainManagement'
import FileComplain from './FileComplain'

export default function ComplaintIndex() {
  const { user } = useSelector((s: RootState) => s.auth)
  const isStudent = user?.role === 'student'

  if (isStudent) {
    return <FileComplain />
  }

  return <ComplainManagement />
}

export { ComplainManagement, FileComplain }
