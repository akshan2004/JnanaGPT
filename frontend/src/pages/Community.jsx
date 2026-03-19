import React, { useEffect, useState } from 'react'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { Download } from 'lucide-react'

const Community = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  const { axios } = useAppContext()

  const fetchImages = async () => {
    try {
      const { data } = await axios.get('/api/user/published-images')

      if (data.success) {
        setImages(data.images)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchImages()
  }, [])

  // ✅ NEW DOWNLOAD FUNCTION
  const handleDownload = async (url) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()

      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `jnanagpt-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()

      a.remove()
      window.URL.revokeObjectURL(blobUrl)

    } catch (error) {
      toast.error("Download failed")
    }
  }

  if (loading) return <Loading />

  return (
    <div className='p-6 pt-12 xl:px-12 2xl:px-20 w-full h-full overflow-y-scroll'>

      <h2 className='text-xl font-semibold mb-6 text-gray-800 dark:text-purple-100'>
        Community Images
      </h2>

      {images.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5'>
          
          {images.map((item, index) => (
            <div
              key={index}
              className='relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300'
            >
              
              {/* Image */}
              <img
                src={item.imageUrl}
                alt=''
                className='w-full h-40 md:h-48 object-cover group-hover:scale-110 transition-transform duration-300'
              />

              {/* Overlay */}
              <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-between p-3'>

                {/* Top - User */}
                <p className='text-xs text-white bg-black/40 px-2 py-1 rounded-md w-fit'>
                  {item.userName}
                </p>

                {/* Bottom - Actions */}
                <div className='flex justify-between items-center'>

                  {/* View */}
                  <a
                    href={item.imageUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='text-white text-xs underline'
                  >
                    View
                  </a>

                  {/* ✅ FIXED DOWNLOAD */}
                  <button
                    onClick={() => handleDownload(item.imageUrl)}
                    className='bg-white/80 hover:bg-white text-black p-1 rounded-md cursor-pointer'
                  >
                    <Download size={14} />
                  </button>

                </div>
              </div>

            </div>
          ))}

        </div>
      ) : (
        <p className='text-center text-gray-600 dark:text-purple-200 mt-10'>
          No Images Available
        </p>
      )}

    </div>
  )
}

export default Community