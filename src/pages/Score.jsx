import React from 'react'
import { useSelector } from 'react-redux'

export const Score = () => {

  const points = useSelector((state) => state.user.points);

  return (
    <div>
      Score:
      {points}
    </div>
  )
}
