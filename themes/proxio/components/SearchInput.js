import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useImperativeHandle, useRef, useState } from 'react'

let lock = false

/**
 * 搜索输入框
 * @param {*} param0
 * @returns
 */
const SearchInput = ({ currentTag, keyword, cRef }) => {
  const { locale } = useGlobal()
  const router = useRouter()
  const searchInputRef = useRef(null)
  useImperativeHandle(cRef, () => {
    return {
      focus: () => {
        searchInputRef?.current?.focus()
      }
    }
  })
  const handleSearch = () => {
    const key = searchInputRef.current.value
    if (key && key !== '') {
      router.push({ pathname: '/search/' + key }).then(r => {})
    } else {
      router.push({ pathname: '/' }).then(r => {})
    }
  }
  const handleKeyUp = e => {
    if (e.keyCode === 13) {
      // 回车
      handleSearch(searchInputRef.current.value)
    } else if (e.keyCode === 27) {
      // ESC
      cleanSearch()
    }
  }
  const cleanSearch = () => {
    searchInputRef.current.value = ''
    setShowClean(false)
  }
  function lockSearchInput() {
    lock = true
  }

  function unLockSearchInput() {
    lock = false
  }
  const [showClean, setShowClean] = useState(false)
  const updateSearchKey = val => {
    if (lock) {
      return
    }
    searchInputRef.current.value = val
    if (val) {
      setShowClean(true)
    } else {
      setShowClean(false)
    }
  }

  return (
    <section className='mx-auto flex w-full max-w-2xl items-center overflow-hidden rounded-full border-2 border-meow-ink/15 bg-white px-2 transition-colors focus-within:border-primary dark:border-white/15 dark:bg-meow-card'>
      <i className='fas fa-search pl-3 text-body-color' aria-hidden='true' />
      <input
        ref={searchInputRef}
        type='text'
        placeholder={
          currentTag
            ? `${locale.SEARCH.TAGS} #${currentTag}`
            : `${locale.SEARCH.ARTICLES}`
        }
        className={
          'outline-none w-full text-sm pl-3 leading-[2.75rem] bg-transparent text-meow-ink dark:text-white'
        }
        onKeyUp={handleKeyUp}
        onCompositionStart={lockSearchInput}
        onCompositionUpdate={lockSearchInput}
        onCompositionEnd={unLockSearchInput}
        onChange={e => updateSearchKey(e.target.value)}
        defaultValue={keyword || ''}
      />

      {showClean && (
        <div className='flex cursor-pointer items-center justify-center px-2 py-2'>
          <i
            className='fas fa-times transform cursor-pointer text-gray-400 duration-200 hover:text-meow-pink'
            onClick={cleanSearch}
          />
        </div>
      )}

      <button
        type='button'
        onClick={handleSearch}
        className='btn-meow my-1.5 mr-1 shrink-0 !px-4 !py-1.5 text-sm'>
        搜索
      </button>
    </section>
  )
}

export default SearchInput
