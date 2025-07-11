import { type SVGProps, useEffect, useRef } from "react";

export function Gear({
  "data-hovered": hovered,
  ...rest
}: { "data-hovered"?: boolean } & SVGProps<SVGSVGElement>) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (hovered) {
      ref.current.animate(
        [{ transform: "rotate(0)" }, { transform: "rotate(180deg)" }],
        {
          duration: 300,
        },
      );
    }
  }, [hovered]);

  return (
    <svg
      height="18"
      width="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      {...rest}
    >
      <g fill="currentColor">
        <circle
          cx="9"
          cy="9"
          fill="none"
          r="2.25"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M16.25,9.355v-.71c0-.51-.383-.938-.89-.994l-1.094-.122-.503-1.214,.688-.859c.318-.398,.287-.971-.074-1.332l-.502-.502c-.36-.36-.934-.392-1.332-.074l-.859,.688-1.214-.503-.122-1.094c-.056-.506-.484-.89-.994-.89h-.71c-.51,0-.938,.383-.994,.89l-.122,1.094-1.214,.503-.859-.687c-.398-.318-.971-.287-1.332,.074l-.502,.502c-.36,.36-.392,.934-.074,1.332l.688,.859-.503,1.214-1.094,.122c-.506,.056-.89,.484-.89,.994v.71c0,.51,.383,.938,.89,.994l1.094,.122,.503,1.214-.687,.859c-.318,.398-.287,.972,.074,1.332l.502,.502c.36,.36,.934,.392,1.332,.074l.859-.688,1.214,.503,.122,1.094c.056,.506,.484,.89,.994,.89h.71c.51,0,.938-.383,.994-.89l.122-1.094,1.214-.503,.859,.688c.398,.318,.971,.287,1.332-.074l.502-.502c.36-.36,.392-.934,.074-1.332l-.687-.859,.503-1.214,1.094-.122c.506-.056,.89-.484,.89-.994Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
