import Modulo0Client from '@/components/module0/Modulo0Client'

/**
 * Modulo0 page — Server Component that delegates to a client-side wrapper.
 * The client wrapper uses dynamic import with ssr: false to prevent hydration blank screen.
 */
export default function Modulo0Page() {
  return <Modulo0Client />
}
