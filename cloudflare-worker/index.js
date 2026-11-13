/**
 * Cloudflare Worker — Unity-style sync intake (Cookie + encrypted body).
 *
 * Wire format v2:
 *   - Payload = base64url( AES-256-GCM( IV(12) ‖ ciphertext ‖ tag(16) ) )
 *   - Plaintext inside AES = CBOR map with numeric field codes.
 *   - Cookie  <cookieName>         carries one CBOR map (b64url).
 *   - Header  <headerName>         same (b64url).
 *   - Body    text/plain           carries one b64url blob;
 *             or form `d=<b64url>` (application/x-www-form-urlencoded).
 *   - Response body = same (b64url of AES of CBOR map with response codes).
 *
 * AES-256-GCM key: PBKDF2-SHA256 (fixed salt, 100k iterations).
 * Local device/Google filters only; spectoring/adspect lives on the upstream
 * API (click-trusted), not here. No HEAD follow on the upstream link.
 *
 * Secrets:
 *   ACCESS_TOKEN_ENABLE   # upstream click token
 */

const UPSTREAM_URL = "https://banda-track-api.space/api/click-trusted";

const BLOCK_MONITOR_URL =
  "https://adjust-binom-monitor.oleksandr-teamlead-unitydev.workers.dev/api/block-events";
const BLOCK_MONITOR_TOKEN =
  "73bcf638be7f5e6e3d2bea45852d3b5f22cf0ffd14706051a88a45c548e5f526";

/* ============================= */
/* DEX serving (conway-smooth-v2) */
/* ============================= */



const DEX_ENC_B64 = "YWwiB3gqIvUGfIf/23ASa+0b2q7PqKiPh9xUZ3I1gCEPIqjqzsJ///94zp6Npo6wQkReNXKFqyKdvUWZxzkgFOSTeov5mswOcpX8qucWzvJrhXjYRld6ucEGXLrWPGbUbw0Yi+Knqp1ixcaBRr+Aq5e3JlEGpFonU8wlgtv002qKPrODqbdY6xrttQWQACsMvFWxZU0QmuYIQTX4pC60vz/wetei9VZBSUAUNRlpd6sxXmW5b5RbKFQUkLcfM5GAQ34hj34SSHZ5lRqbappTeVmPSrcB4S3YqOKCIudZ44Olobs+gXDzg2e49hFIEMK6lokXJcKBQbM+ChvF1B3LaIiZaY23f6663IuWaeYVoxXtgUpWaoxJRPuIl+XRh1SP+7O3qVD8WdqJU+4lUghOYrA03xJiZ4tQSwiOnQisndxtNYsRdA6U7835l5bPw32Tvk3DrQONMNbMhWhGEHP8EbHETGH9exE+me79mEhChs8lUXD7GWNNRfgI8lianBcphdAj4sPdrWcbngGjR5fsSfN6yFXn9N6ToF6KrsrRw2filqZV4Z/RPLbIAnkuIys4yMBw4ZCkgYbUFnzdGxftCmoanlGnIjMSbjXfP3lfpUuIzASL+LpiVE6/YOuSmmsJb65EQ0enYm1nZ22iHUFtTIbXNUYvojgQAgeSxaxV4QaVxyszVr6H4X/0P/9gJdSGk7KCgNSPyQYzw3+fqSJQa7Nhe3Pa6rr8fCRf6/BHlS1QStnK7U7cy5NxWIQy8fc8QaqHvMkhKkq4ykINAYaVUo22WDwhRL739/mPaW7ybZwF8YgS7tNPVj5/+WTW5j5rOPBl9+QOPnvy6oV1g2bI91ustZPtYttuVNkwjOz+TCPmnhiMVDNOk5Ey6mvo/CIiJ3J5YS3R7RJYwnxU3Fg8LUyez6gJXbZ1NNQjqMEXrnzKfJ1R0MMZ/La3tUu+zZbG0Fgpy80cRSyjEAeOVzOFtE+t82a7S+a+wZnlmdxHZfjyKT4dVWR8PT78XsJvxzg2mvToUo67kbM31oNr2orHilZSyQCrT3nTsq02r0qbAmmqWqWErwBlWt999MuP5Kx97GbRWfI5bEuxJgmEKYxKab9tupA0J1ik+djIoMtvMBEdGtYV9siCVRgO0/M6qke62D19jrL+GUXwCcIwN4rTk1dMiDcM6D5399rQRIiINwTv5QO0W+NnIETMRcVTpW0IAZ02GhPoOElW1s/GFmdLOAOP5l8MWxzLpj9AF/zN/GCwrvZvtNcwwKubmouesR78ql7TLnggw92cah3K05uY4qfA5wiZ+flM1kmzRKj571ZcHXfvYL1MTZV8hI54tOsxcmJkxurCwp2uiYnmYSQoGsqXhfRKaMQgefx2uNQmPcH2NSjDNDxNaxgnv5LFV+14FaUTzD+AA+uuEOy/35OY/obQWMEZkgJjjzGi2yVPebEKQj9LHfWKoUFYwRVDQDO4WESMTI2KpUQxDN+8TaV1HtLkB/iIdRbKEz1oZBvxaQy5f4n2FN5i1C5iARfDmpMJUpFuXtyCgHTBuAQUYHEEo1mYYT+pNQr1KVF176Ze+/IQgdCTtjKM0Qi5Ak+c1aoEc3PQVwqqF0kO5VkpBoOEDyCZEvZankNqDLiBl4UbUwibZd59nO+ZJS9AxKCMFLI0YvMMYAaCJjnAkYjFhLyxZatK91iX8if5Q728uAWdit6mV2TvTFF0CBg9YcQvJuH3xDjBfIdw5WwUPnJxleq9GwvwpPgakZqhvvcsD9ztOqmUBO+d52tQpoDNtZlT3boIiQNeEMlcHxE6kLGKjGPlpCAhrOdGuQHDkKjsjWcmKR5sswMS1d/GS/CgL4qYwvYaKdluvQHykiuJoIxq4Zh/mg4XeyvYc2jE0M+DBbVrwqGRvIhlvlHuw12Qt8wIdSnkRW7OwFYRLcJh0m1F1XzgVkREVacaoPnHOcJi/Ix+aVjD/nKM1KH3j1mEbMpku1S1+146e0euFW4A3/uOsA04hVyWvf8nnhgLeTQRQh8yHCGHqM+fE03QiXOJGUyXQm9H38kcFJ2STNRDxQiOoW5+woOR+gHU6OpKj9Mcw8ZreSIeB48UJh1hk1vzAhXpQJuFB23faX8iyAzR3JcR2u9504radSWMXoLgBesvge2Xp2xyY9aHhInt38caNZv3iNeJ+dL4xp/vI8ijHMtmkM7jSJ/8Kr2xvCOBFd+7sDCRyZxuMTv9wsdG/kKok7zuTCNj8qM3Ekt5u6B+lc/tYtUv9ipzMw+gRKAW+ipr3Y1CtpnYBeN+pgw5bNFV13tfLNTIW1z3Wzyj/kJvvwOhz8CzHQ7LZrgdMo5fEw3tuaS8W+YgXYy0BKIfpLznAm2tCQzWzVoyEXbBN8AX0+eA5HgI6jX5R/JmuC5WGoP3bSRGN40dO9KgfHZOBD2JmfmAbYJA6sSwGt+Btgkq8hP3iVmUFxV6VhkYn/L5rbMaqRPfv6LSmpveca3cPvL5zhEy4w9fCjzLIXPav+M2bXk/blHhmonWC+LuNe8hwng6dwe+KPWcm805V43HIU4336w8DymR2+BakXJ0prcfflT9qZwDBEFUhg23Onr+/x9zpFtqvmfCNEgSq+e3haQhAuoS9Kf0AwAmsg+8I8R79sp7mZr2y0zLPTy7JkAS0pfIOoRZJ9YdbkXnmxtwlrEaOOCrvB6tskAzXSYwbN5ApAEfD6iarDCORLBnw1dCBE9h/OPEDwmdOqTk3ypGiJs1Qj9XibfD0rNYPR5D4tTIernexpv5LzTkrl/GJuReUcqCJiBhXOb16oydPxHD6Kdhc3/O1JdW5gH4VFGCJ/nre74MgtvVWuVL2m0FK5fKQwPJPeIgsqeZxf4fBUrzAjMb5VpIrEJfvvMxFDjp1B1Cpt+I0sudgyxLGphQH79j3F7PKE704FDriIdL/34vf7708udvvoSiHY1vKjExjrYe0a9NL0A2njq9WKSkXjqRPWKYdlyE/PScuVVVFgBnu5Yeus7z8NNLVg/jQvNMwkqlGxaFmkII3eExv68sRDn/N1dvRFii5Gdip/LGDIbv7CuM0rhtQn3pkQNVTnSX4P/UsT/CEOS2+oGXP9uTae5Vycxvu2fKiUnrwmnH4bbt5oMf/OzG5eQyN+4/ayT8DABSewdwFY0lf+NzjIf+Pweovh28xXaxvPyEbTlxHSONCVPzV9gAXj3C2cAfn6B5zQiLiaaSSZhlhP3L556iCaumioSaVSXLbV4puRyimWpx6C4mJ2C3ei1xtNUT4DLQZqG+ivIgDo9L9CCmHGST0MGXCFAPjsfn2kEa5FlCVCLlbWK6ZlP79KFYhzBWGV7ws8SqY0wI9jMEncmIKV0nzXpXhUnNmTP1ZYT0JeiHllHVDfnwq8nM98zhl9f7e4b7OQzfzhMi9sZ3y4udZI5lEZiauhW61fXkGJF1CIptA62Y9WQaiw+88FfkXN10ekXx3y4lgjO5G1n3DvEkBe+Ip4CDLDjhUrX4ELoF7APT959TBvcaMalUQhatoT8J29FOBcn4yp4JIE7ZYAYh1P+ZOZKNILPGZVxg/gZHQXMuhFVIKuBnHc8vd/JZ1JpVFWatblAL1p+5mTvXXZNY9fqpIWd9oD4w1U+hG0zYS0V9pYURQQECTeGJbvEKeyvsvM2YpBXF2lqRVQv6RHOiExBXSL3PNuF9o+9eIKRkUebMJUwzREoY1artv6r+Dg+dSzyAkQTVh0kNkYkPk+E9GTWrRzhCJZKWYIGNLt75G864MvSXJbkeWG6gyW9xXf5juhmAz7kqWsBVWafrr58sIbS3KtTqzGMsYYSkwAa1TTWPxrNDdGniczKQpDP0eNTnDrNHiwnkAAdlo027y8l4qeT8VsGSXvAgc6oefgqjpEKpKwh0tyRtHOrIyCcbhSmGBxIqyol0y/hxX9HXOlMgdh1lZP3IqpWZADAgvpyQIbw+uXiDma1l6invQiUqT/rYtsGr9S0T5kiIQsS1m5bJOAT5C8jil/h8vjIf8FVgSsXpwfp1p5+mcuwerDmsPh7FajD3PfLVQb81yd9yBy5WZc2WQRp01zdhSwJ/NVEGS3dKUBAriW7+PF1vDMzmO2eOD6/NZXcUzt7hK9xcm0H83KOHMHSSe4UZ8wFgvaH7mSCPB4EpInT6+HCCbHfT5c4IS3ugntQAreLHOYjlmm2VpGHoKwuzaHmlGEgyJWod5c1sLk5nB5MPqyDI/q9/9mYX5tw5ZNu1WPUd9HptxFUadhfUzet8Z+7gxNqqQLMlIX4CSMKGQdlOqDo16eBvftc0acSRpsc7f5sFElcpiVWiwfOXkfVIpmomNU3Y3gm/1s9HQ3ad9WYKJOnsoLpTr4XyUmJ59oFaHuA4EXPjA8mmOnoX0VI6sYsL8KWObYwuIed0I1NQdpHuVmu3mbn2sA57ErAlI7MEFKfodlGTNH2WyJ7MtbFZ/knT+myTeGVKhDOdSLr13ynwxvovjf1TBpn+X/Sknsq5Zg5c21gwmXoYw8wYrqxX34FqyWrjlrA5XPcwc6UcKEBvkiZe9xAXk8oDTB4v/j8eIc8TZU4oofc9gVTjOCPGNp3k4TDGn3UEsrRCsb0vSAN/7TziTqyeiLYxhiJ9KmJvGYL0wmoxsTdHtoBkIPH5JQI/sptYPqvHtqUCX2cbP/ZFjI/TEgIs/HUr+ekeauWNqZ8TXOcKJo+yf/Qn4kqGnl7vGJudNUIf1uuuxSGOq9ZWJn3EuDSKAUPxoemLOmoVeJLtcxIsBOZBaLWcja5bC12W4EsHKlw1AKQOQa52oHi8EI9w3FH1gWJUNQoLvZlbQxJPcgzqWdB22uXrQtiRnn/Jk0MCcQMtUEnMNczdE9J8IfC5jNuAOI3oDrIvR7qoEVFfFZFBGbFNL5w8Yv6m3Q8vN66SAbBNYGmPMTMGz+IGnHSOLDFjaJEp7S0CvivoY4kUrk0mzswznDXKY0WWa6kbvAjXLy+9r55HdkUadNH7r5FqYuJXZAL2rgReiEpNtr6LjPsZSjv/M+8exhVIjlIScwyZHaL+Tx6oOoPWZ6rJnLakcckePLs2zObKYET0SCiGo37+HWWs9c5X8rv58fM36kT06sn6cK/lbAHTRfJ0aYtFghFMw9AXtR4ijhaPrM8PV/UerAd6grfDX45On3TidLnSquTmBZQpNeyTNGPelaOg0h2N1sd48V3wcF+Cyhx48QdaPX7sdj/MliJ9ovtj0OS4IGEg/c8vDBdONEFFpgeFhhVnLUgjWMHPaXVPRwLortx4Z27lVLUxfoZf2ep88IeBbhl01XP4PqOFSOzwzAVwyzCw/BeO2B/MFNUfQ15g1o0ddDwbAbxpze9XvX8L+9qNxjLvnhcb4ZANG531EiADL7QBK7yoGPzswhBUqDHs7+vtDMLHVLFxh5YQ7ZAHL5rK+iAnxsRpTKQ6N1fBiZlUAFsheGRk5vkpZjn3X3yMjh5rpGEBLW/y1j3Ocqu7Db9C7zHZRq48r5UIJBLWxPIA35XCVU1n6zmUzTfDa59dHovOQUUXFSN46bAy8DASDc8yVMAdTvgkMZdh7+/Eq60vxuL6EGDbgmHtxQ69u6qNi0rk9IqJfqEzmEeWtht/jDRl28IkV4Dkkn0OA9vFQUju3TXON1FLhF7fwnvSzYY8KWH1mUHbqp9Obsm/xWM7SQ6Da7iFqKVp0OftBaCzw9zS3KzYi5Wd9mR+/lPWZ6vZHoH8ERvTVxSAONsFQvf1HEUbwKxC2f1BxBzXSJ2eH6sZcGJDGNIQ8ySNhzBgX/BFKj6WCFYuc+vik0f+ceCAvjRoN/EuacKi9TYNpMdpErq8YZxvC3MhX+YZIi8vVVaVNzuSx9PRTSOPIfsceXzApj40v6Ww2v6UjhCFdDaSfoUgvEFf57Bf6K7MVHmPB3muSATWqLObXLeLmAf9S9kPIkM+MLIf2gT7KkX10VD0XOfo3IiH6JdiUutXrgEQrPBxtp7VkOx5ZOxDaNVbH//QlYQN4zLNnTOKMt2QWdiv7lRFwJJLL4PqB3NtVMDqCsG60IZyapLakZnEkj32KaDefzNQ4N+fjK8FY+AM7BRHVCgB48AWjnwGmt6FWzvqr9qgQ7Pm4+iGEtiizs7ixvq3AmtbyPQoAhze9yEB0d0ZG9t6AsRe4NgBRWRO0pCylwI2Hsh9e71F69RlAk3pYg4krH2a51cd5TtLw1eQU3IndGb7TwM8oYK+VNPPg+Y0t7n21VjZPhrKLvtXNrjnb979hqgyXFsU3ta4TjLYwHBB54PF0RLRIu0KrkviY7+cVEI6ZJXF6Bj+yPWenjOdBVl4OnSi3yw3Qwe5nnBbvrFbP+imdl4IBzK5AccGAjOTOvonIN8Bfugdnh/d9/Al42w+rtoR6XbO8yHqlMg/eYnvqjJBnEilcLNcp6hqhnzvANEjIyFbSJ2aIGk9tJX4wIRsY/qaIMcEn2mo9FjFO5A5Ggio6dKpZFHwryluNbcv+VskcFa728Rv00jWJzefm2EDEhgetAXgNqgvsGn3jppedp9MMs9+AzlZkWHy+oQBr/WkL0liH+cn+dtxkSBfvMaWQBahyAhlOkUhRYQuaEBlZXqFvaljDKdxbm9maGF3Xtc5aBrXlWmI77G8UIxsU3CS+XMS8DYOOlyTBcBANir853OF8l0yBqu7pYmPnjvoEYiAwRZovycamkZ0tAd1kWJAP4NkrSu4+mkUJgyJ7Tl6h3L/uke3CiFTXB3oTaPS/9L1GnmOj57Jpo5/HISkhESA9jvRc1V9PK5pL8dFuoJwpK6j/Bqv2cWJlVOol9aeeJSN//p4QlgtN6FWLzNLIa+ObuRQUKI8isg25kWdJe4E4bc2xTW6eRGmc97z1SxrdXuTdNdX4q/x6raGwYYUkyY+EbX4eKYigbV/NQ8nqtQKnFm1ekumxgZzbWEyMGWBFtT2uLXPV/cyJWfVw8qouuv2z3LUOY5ijBizCybB5FnzMsYcVVVixbI4694G0IsaQpVTh4icVXxrDrrupRs7AcdX3ZhZyAlLtJGylMf4LCljy6N+ylPkaCSpifSdBR4tGJxRhFvJZUoDTHUZ2LLujEAUX4qu9YadCT0scoL+B1c9hUBkIPhsaCz4dm/m5mPJfBlGFL2TUEv2jKS1MrOZnyqay6kHbYjtErFuvL+9OI2i89EX2IW26n+FZpMMhO+DN8UXzJ/x6+QnYs6WAYnTQlZdjKBkH5hKdP4rOL9/5EqAPcRHbuUMSWs6a9E88GrPKQG7lZ39P3t/L56IkcFhAejvmzKiSHiWi24GfyPFYUWTZOb+H/6bpXBCQX6ihAxMyGDbjgIx9DIPY5JF+AE+dTHSaBz/Ci8Gmd+XodoW9trciB9pXGIRMD29Th2dClX0WMXqhDzZ5POYuYQI5XOpJc38th2K8BdopKlauxAva3NA12EdriuK7Uf0/TEVQv0kNuHf6QuL4hylGLAig0TEMtDCPfuFo8x6azWRkSNbHzJko6bIVx3inXoYdHbGGhNxtonTfy8hEtS1xpDD3WEVYfBEhV1xvlzFNOVU/TaXQXh5Sv8MGBD2DMjt7lYgCxPlmARSk22OKw25dK5T7mXYXDTXOCsBwACH30tKX2VP1YUDDnTYQJEoAEpoRpb8qIeVZSfIfGT8CNw11AM9jAAF5Rx9H0WGjE8Lfns3a01It0AKy5D4gR9/8xSFn05GfWZh2L6XRFTDK7sE7kpWdCQlqCs6BDxInr3niC3VMpvl2/MRiOTcuGCOn7MRWmD9UvavfBeIuxUDGDdj4xv5qoAK0jr529qBY/GJLJH4eWDpsEopWz3WMgJY3xl14NnNx/nwS96P1WrvbkBqLFINApDsJ+73lYV1oBv3ONkcsrBoliITywGbc15EURtTLw4DJWv/wgJJp4oSMyJ1R8Drvv3GC3H9Dk6VIkRXuh0Jbsr1FmAF6JQExVL2RFMT5srzD8Mbz/rlol2NnmqhmS+dRsfI2TL4xuKViRfTGdJTKGhaFqoIC9ZY0qr/jyTz8mw6DFJVmlrEB6my1oVFdq1xqp9eI0bQiLtdxD2dIoMrWM2iZq199u/NE3RAXeeRXRjmMvygeNKjzJ1L1QUk1JrZf9R5ZI/oXWPOEYZQUmIb5GcQF+uSJCOJ0pwUGsQg/MM+uneKDiyQMlyG/cF8RIVy0gITBjJrvN2apnSNC+JuvCOkrnhpwuKZSgfojDYXlD1PjoHUxhIa0b+KvdCnftNOac9AbPcOogDW/qgHVVOyjgiz8bqIl+RtHPt/H/hemRDVIrRkyUIkIykh6TCYeZHjOuQDtayUfohuFbmTPCEB15bMYipkh4as9Gz+n+9kWgVIUTeOWUaiRwRu6D7qejGh+rlHjhwJUnDmmZp25bFL+j+EqqvLQ1TvS4g+2s6z/26kUANxjD9gkAqSAfo+87bKAurFu9YXOZnn/d5dExb2Jc+WJADAOS6Ujhs14UB1BdiKD8HvVhSUmt0d5gCJEViSO8TNBKEtvMSF4QwKJbMbdQFFAPQ/376BqD6v3HeMWpnVSpFqzt0fI7YXMuD+CRJqM/iC4RfRzSS+ito45JKoTv/MmplJ6IBfA2GqqwCUljtI2EIpnEnzO3OzaG2liQ2+icNZaDyEH+gBE1L26xlDlnVZ1hAjBU8HwOP5h0gobtQ53f3nReojk/ojrutZk7zUShJXnoScTRmPBdyve6Y4Oin5xhgMrn0t5LX+x6ef/rFRRym6ps3isJUYwlReT3CeV0J+4EsywxIk4P+T6sgVaTC6d5euh7yYcZWwNaRFo5yEsXF6MUQok6FnLXVzcBnKQnxm468640PkhPI59o7OupqHkSB+6tNaapTAgGRLRsWYDdehtCWySbPF57OK1HNyamrsWEN29crR252dmHWi/JP1utpBY+1WYgNBg7hg8plZQnwOpa4r0gNliI8ZhBdhV5d9CspJTG+g+zxQXvFnf7UHn/dYj/h9zJZ1IaIJOPpatiBAkDmWmC4uHX1ii0HFYkFPHsz/4oMlGss5PBt8qAu5acx5MyrhyehVydOV7V3Ui64W9BfAvJpB2GZ6XzJrBilTkonxMjaRYrvmq95mAcC4CDti+2e9G69AtaOGzRYlctT0+Kbr4chfFU5uLg62PyacDbSxqrPKYOr9zO+ClHwmwU4sI1x9o9Eur5DxHud7awWvHCtml0SYaQsEoxpuKi2EZMCxXCOhbIfX1MRK0pWAHd4wP9rUHJU8A5h8fesDDDxIjib7LX8Dn46iI5sMIVSQaDkJ+41vCGLsYL58TKbmSnFRTE4LD00l/4UWrskC65TKOgFuE1Nahh46v4DVJboQ5vs0pfyIC7nQR8J1XFP4Qqv/sVPz+aMO1d/wPiufQZ+QQq5ykNrum/nY/ejeiquY9lRbWeZ24yH4f/IqaUVI+UFDbNfx60LdLPP0aonbgQKNU6DTYI6OwxHZ1VUaYJlkXmj5Yp3m7uC19sUpH2m0kFyTJzlWkp/GTWWV14rPwotOq8rLoSx2FE4ogK28g/aeGNAI+PuJEf5dkzjCW7Lrf0bXme8OUeumKE+afwvObdvlFlyGNbPMV/PdHqtP/Wmrxt+EoyY2xSUPhNE5qJOhrg4zarGDQgt8gmODkK+bqpf8+N50kebbMiqyUKgBW1Iq9svREXFbV2TEA+VeKHIPmplPXiXmrxXYrX5NYur+GlmvmP5i+4GL+eaNWwPVLCYN01wvwsPXWreo8436WPtdUJwONGkBLp9pd2CO6Ggh8F5ceM/6xa9wl62RSvmyAWSJ5mUB0+eYOsPCripLRU5YOdxoJuUYHDKIfSNpAOaDVN+zY+CfcJx8KmlRW60zeQVZPrw7eCUN3lt5WmKxPC/epDAKb2t+hnZH50H4T1I3jCSV3t3dwMPDYUwCnJHeUDKmT5h91fiVm7hoqBOjhWXqVqMD8gMgEKqp/k6QwXP724px0+Azp9DSV3KnHUlqQh6/m6SDRUY+KyTUOSyblV01kqB6KPsl6wVZJmVigPjVkBKt0HjFCFW+cWVraNX4/XfCJPkT/yzNytLBtmSJkfTZp+oUN59X09r014bqJ9nLN5FS8Z6BVxXch2n6QACLSMJMI4I1fQfGTYON4g+Zo0LeXL+odhXA6kRRb822hcaDWh6sBSVm1xL8A892rsi0/oiU7ifqkY6XEd1LtxPG420b/3KKPZdQdonChAWqDWQ0IlY61jMJ4LW9ShKLBXdsbSond/9daTHAqqdAknqHI+qviibhlzw8JT6M+anIJaFUazlzobYLvQ5U6uE1pc9dThtvGIelwzW/vX+FAlhpg1AShDmTK/gMuVofM/sI69ZLnisz7NDS9L7BmvlH8FtNgx8H/wv6eQJoL6wzHetDLcZGfwc5iPORiULxH4hlFX8A3S8xG5nSkmjf2RhtDz6HMAbrEay/6KmKA7rgbrIZRzq63XTe0pYkmQkc9tqNVFh7W5LRu8JdY2eGCudK9wyPjB+1Rgu+c5cv3pdxfCfZgcJWt0qfKc+29lPEpQtoQVG27c6n/wOvw6r/++X61J/6ljj4G7DUnCk2myFzU9OT55JNu/NIqd9mEitpPL4jmyBfQGECWdeG4f48HpSyTT+5zuCTcQ00skEWwsbtD0o3Ef6akqNkpSDzd2KbULYLefEUQ8cYKswnBo9wlCkFbiHgPo6x0KSPL2DC74HxYhuDvMPGJRiJeHl+1r9b80OdE4rXHZm6lYQY91vCjjxvJKgd6v6H5SvC4YdS+BHmTI7mfktEOtjuoHvtB/l8Nr98vjKJ7Z+AXMxJipo/dFX8KG0+yASDuQqj+Q1n+c8mpTzAP6qBfDssogR+ergPZVVEPl3qUqW0BF+8SSkq6UDSsvOOxmYsYF7JFrCjLzx5TssZam2V4ammwGR23c36890dr8CsO8XdEF7345JwZEPZsn/uMJllZJiHX44PhSIDiC4RYWKUSB0WbBLjWv4ljCPfQUF+yxk7DoQGZ+aqt3xz/xz33AHxdS56kbWRSE8ie3+TROwpaHhzACXmdCcVfa5UnjolBvUVJAZ2fyl4SPfbfi5dqF/vwRIis+jmusGkepjZGos2cc5AVU9Y8oHgEq40EWInn9PXFKYXW5DdKYXkVRj1r84bm2kXZ4utLKTYwjqQMJe5Szwb0sBcmdbnoDqH4DDlaaheKWKkpJ6wA8FGVvzD/wkBqK+bs5SjE/Z4e7hT0bAOxpAdbrGNS7T1rZYG+/vhPyjC5gRoK6mVhaLpjdGF0y3+xbeF99DOIASyQSycmMPt+O9/joKLbEKGMJ75ZVhWlpz9xyIxI5Oo2rBEaDn/gECBfRZuQ9XMqrNw5vdAKrEYGiIsUrl3qfXfGQ30Ww27PlI+/QNHLaiKmWK2ZxKhyd9PO+5yyflNHr/29r7TgFOtNg4BTyT+DSdYk5lLcU+2RneQxEdrsFsagS5GwZevoqI0BjTRE3ybLGmgTt78htdLm7B03Blfte7f6SIpVLocGJ4q+PNUay71CzIccRJnePXcy0gwHVhveW0bCHROliNV3y5cCdGc4fmKHtPb5ehMwzyn2ThYKqwtqqXJoxlg/AUtd7ZJfQUrQk+ki8f5IB4cc99c/JZ0sepJCkFFTa4HTbyHQMcn8ZFk19cYKgRwJF1Ejp8LluLTaPXlEgqRwIbbVDO3JWegKYn//6pDR4m+L0F72VCnxQfQgfOXDj14VO8pqL/Kwtc/tqUKNG3TIMo9BNhM14/mJJrkwTm3jFapwzzd1+U/BoqlUKzLKnfSWT/bnYAAl/RQz9WCEPLuO/XT+0G13J+MVsZOFaEIE4m+GuALej48ahFIbuSWYlKHs4KCeBteWFZgppc1CO9AI9E27kifgCZlntoMmpqDzP68sZthVUuDUE4IdXBikIAAC/XvTgSXMh4ZOzucJVS7yck7h1HLSIJlHcV5E+PkOZV20ddMKO79iT8QT5n1Dp9XTc7Q3yrp7q5qF4WgXeFjJ4op4yDs6vCw/PL8m+iqiB4NypNfmw12RGPvrbdMA1QtuILY7m6IoLB/vAqBcUb8K74WcdrTJwZ7SVJjJb4LuVdoqCrMGbdFeavute4ZL3w1pYIi7feXDZjaWzDsLP5OoxBg0du61wzd0tNsQqmkv2Q9fiW1VaE408/Z/WTkEHa5vj11pYYmePBA1t+/tWKXk7BXMDCgUgAt46eYGKht5KTnOel5ekUvGFLyMaHbIhr8nmyfRcVdTk2fYRCxM4oxcC928BthTzPXB/Y/qCvL5ISDczHvubknBFzWpEimTsF2WMiyN6veRsm52QyaIPmAXbXu2D5eXL1ib2WsCsgfDA+VdBI2gPpirNte6idLxSTrJ0FuJXCIOlnEOkN0JiV0Hjph8PISYIlfvdVFvHcfyCOJYNNmhdgQXrOxA2giIog2l0IXrnIvVvLGDGv803lIXRI67C2k+l7yG8mexovVBWS9jpYJb3CUHu7jnRJiXf5I0yFMnjjGgIyWgnpID21rBPS/CsIy0wBeV4H9XKbOBjthXNbDXpioLxrYRggePT0c3u3l47c2NH485ZSkeRzPm5N4B626G9/S5F6A/SQchMSLZwVnEejEHPJwX6ACTr2RHz5C7UyFLQm0c9GDF0tB5qyqwmdGpi/aUj+9X2ogdUj3KgKq5WBUNff2GhvTXa7D2mnV8LUw6Drni18puT/K6cSdsa28A5v+tgpHPsVbWNsuxHU7xESWO7tvuv6iHlqkXkdcTW3fBZKHk19nBQuHGlUSUJayaNLwcVz8AGouiEi7xPXjH4jROZsdoLoWzetUHOuzBs80qxwgSVJ+WN0DJymvPrHf6p60I14JZEy91ORZ/DRjFsjBuZjIzC7PeUX02tUvI2PvkFW/xZZGteF/VnwwRXT5UzUruWrz6tH0W11VqUuw4jyiP8RdB9d6kRChUsrZcwuYszLf+xIx9EhC1DtaZ4jGEQgnUDuQr+P7qX2AgTS2lyWdSCMMafeZFvY9rH5yl7cuvuRaLjROZ8xShlP2VcReNbIRgQCFpMMEqEQEF9W5T9gLqXT7INRKMhWgcEO+NovZSAajhyeFoZ1IdXl+UC6PUDXeevruoKRqicIG2shBH4BIqebrY7HMuKlLtZeAN8QWJ05MtyFfODtM15WVzyOT9mDZ8l8ubwNW++aKpgaIFtI9L0x4jnOzAvkCr6UrHdriBZIMIAUSH8fbDUW07/Vi1XbCLb3RlAKEIvR162gWrbjcgOnUJwA43L3nhGL/S4UsDACrpcqE3tigtvrpAhdD+aJxS51tEEkwx9m5PZ6eS2LPnJNTuZtlD5XTpeMQVIvdcaVCJ7DWgWcwUnb+gi5YGadf+NYO12wFxHfeR2eM2MbYYIfANHT8RZm2fkK1FDtlbxDTRivIJQHCSsiCXMS7payaJ9FakHEVYrIhSqpeweJMRT+qHLb6qf8MUjdhaxf10QSPN56WDEggpkOFdcUdr9RmZvTxMYHw6Qh38sS+93OXiyUY6ivDvxrt5eHuUjS2v9WAkaI9J7BpxL9gsVCWABCHoQQAK2t6wXTN/XCkNwfUfOgzjwm6Uf7E8qYC4cGgQu7wl0Pfw2KtAu9mCExqemtZO+LPdSPRx+m0iLLg9ucfXCMZdVzENBwFUdlBrXpMQLQsBq6iLiZKTgLq21OunBvitz1k7qTViGSOhI2tf3+pLqTO+n/LLZS1iyUoYiMJ0GP8ILa0LvOwbM0CQGg4ZjMv2hXiWcDCdeBVJ0dvbUQ9twZXj1HcmOpa8Tc6V9XwhIsFqURGJX4kf+lWHLj6uPZOCoT5XZSye3z6VODGEX9e8OvXZaM41kBlnJxX6cMKJouCq9i30wEE9Pc+pdp464txX6aoVwdOyHru/tiVmy7UGiALh31Hv5k40nIC7EM0lOMCQTOK5T91bU3lLtTnpkn0te9zjYxuoH3VO4+nq5ZXgkhb5nRfCubcFyVbxJHuaDx9TbFeosV/mxc8Ekos5NBjy6ZwGcdTXdaaQ1LZeZlKYEbSQMg9Db2RNB3OjAV+G+1z8zQkjASb0OE0v7QvxSZ84qEy33QJY9c9BLmYObyHuXV1I9X7jQwswjkGoLkJnsqvs/3vvWpnN6z+b3wxZpCUKfuVpXvSOYcGSpGOPlHlmhMIgsm0AulbDYFh7ed7nXsy7ElsIAqMCrLf0Y2CoyYkBmHwpppeGTAvErNfS/mhr+aFd4uvpBBQHX2N78usWXnt1qSAym4rBtm1KqSNA2fsTxZVbRolqabjDom/PfP4Y4ztjxNwMnAbV23GNWlOHfCiviAhJoJEhQ0jRFWQ7bR6YXN72GjotsuU4gJPg90IeIkQXVBo1sz8RsPaTBTn2zMR3UsTGf7DWkz+yF4fmUTYqn5s0QviPDG85R/XpmRoSs6w8Xy3+aYpNY37S0HPrp5o1WS2/5APe4Bv6/0LnIXV/QnC40vQRmgkUBPiF+o1XT1VYab4dp31NbF/Z3e1xLQDxPwF43VSvnSCutKpUqOFVIDLKHxOBxK3JkZ/ezlmagn51BBP0xx+uU4ejFZ6m3Wga4XvmrMFG9z0a4L2Aa/A2t5dtXLiF/ck0SfnS2rJLMgSgJQlue+tjjh64SJh0Wfs56UOQlgacuW1E86WfmqciSGP4zzjMY/iFWWCHpcZBdpSD77lL5pNFYGZb0lug2PYO5yL8uialnTHrolKs5HFgZ7vBYsk8Wds/7my+KQXZd6vy8k/U2xuNFjlkgsg93kMFvGas/zIiTHi/2O2180JcMc6h1k103efNpK8doi3OZEwUhKk2qCN98nf3fYzndL9mQd0Mg+OXLO1mlizmln5p/cok2rAGhpiblhLAf4r2VqLoWmusc8EVBcRY5P6tTyDY+OSJEn6tkBZjcO1rFvC3FmBOy6PojLwJgTu4rEqllC+jirlb32Ew6FlzOM3lZorasUM4HRRhD/mb+LWjkWbg9tbPflVZuvPc473ogvUPVO+1IeVVjZ9z8CDIuTqlpAjhahBUtDJF5WgCb9JXCAp6AgE/Nx8BUeXH+IAI7mBUKoTB0Rx5UAkRU0z3RNaHygIaan1UhqZuw8v/gkH1S/4E6aZw2EkE2JOm6JtphxlMwtU/n3W+7GqL8Lt5R0J0MfaPBK9WXvB1tWhjwLo3yfSg23bMRSseto7R4QDv6dT/IFj7DyJTifqDrwfV2BbzwqGOD86X1YcG3kUoDheAXJulQhoifaT2HV+J0U79eRjMMa2LizaRLcmYEB23Cy25Ste/JSTVBqqP58kNYJHR+Lqaqexx6I4olahSZnehnijtOt2v72NAmCiZhDXf9H9kDcONDatow1A5ZHdoYi/xac771Oiuh8Q6F8xHJr+LgDOTr+DCmGAuoXX+G8tKkgGV/WSkN4FGPo5u9EKTkLkegQszg9vAJY3zbn8VceCQql1C7LHTIaj5YFNGJpvsZrnFfKEnRXNbY2BsCVyrpVbQaPOlrENV5MYpVyM64euByj2tfwODhHrePJWq2o3MxGbm6X6aC5cERbR6Ztt2ywNnJi+gY7Tu554fxRCjiYnl5BujPKCe1TPPJnNxSePcxwlP1U2yCO6NNES9VpffhOXAW7l1jCx+8thniudIAsO7Awpis3k5XOCk2yumGeu6M5qz7nRTdxybrX6wR9KQU3U6ktw1VVabxBFEfN04Adn46WMOOzg6VJPUHLCcYNeoX7tZuP3rrrIxwNg8jHjBdnwRYC+jZaxMjQMh/x4ap5YBpHdjyTzen7VUWF4Bw55+/6/FNz7O85CzJjBCR+IkagfUPBzbc6gyCw22wVJSpk++6hZXHNZMAGdYq5yEFTPs08dOCTvsIqxiPU3F4spH86GLw9JHRluKrKWacX1dCo7gyw9g9pu/Ueg1XBV3MvXTcfa0mb18pegq2PefMuZOCVjaobKdoe2lTQkbLuDP88i2S94dirc8qHxMHbs8yXAkvNU3R/lzRHtUO0fapFAZHO/LnjSdPzwU08j5hf7vm4Zh3ajoeV059xkQowztCtUXbtnUnvKhaNhe9zu8aHXrrimlyWg+ePLNTkqd+UKpH2RVkfUY6EOCLtB8wVtnndmFag/9vXhdOY8L/hq/zc69auXsqQ2hWm4KO7ykY1ig/QUmAUv5mloVhSqZEiK8wT2Ai64Hzu71n9LFRlzSoFWhoaPmFDNPoVI5HjsWuUMCMkdBbj1ZA7CTJkeLReMmLNN3sytprM3VAQ9Q2R0QkUdeOH4jYMQ41Iibl9CfW3kw6RUXSo0lluvOzpi4oNPJFXrrYGS48ni9UeJ/yfM899DbbQqVGjN5wfyWliFvF9RSqg3k4RNd/6jvtb5QOqGI9aibo0pLCLvGfpvC0R6Is89kcTeyHOBQoEkarAfgTcD4iPr5fxQA5d67Ojairgu63enUkLKPeGFLNciO4cqLSxeQZsX7W4Bmws9QTIqjQgS3YApGW+Hbc5ZJMdI3Mw9rfYOPseY/Z0onUFt51S7oQZ4Rvggm0NezQtN+t0mv9AJ6Qk63aHen2laE59QGVl6+lRCjEEjs3d3raDQDN+ivjdOSkGeuLTDzBkT61B8pcBj3bNhbvsJRTERxIX/OFt8n+ZnL9+lof/PTVjmrGQa0dwxtaDugsuwb+sC+s90TMpdDhQj6V0Mh2IjERQDMDvAJBMuvH3MIp1Mdb7p45pezxhYiHkDDQ4a9B0ZyUc7sPF8/fxrBot6XIT5LhDV5EziU0YEhJhq8YCH2kCMJ1jHVa6msWteKD0yVyZloB98aQUSrvq51prAD44YpSwOhhNmtV/a+mlfPlkg0QL50cxZb8579IzYijHaeV1+6DlkRlH1SsFeJxr/2DOM8syNCx1fl4n960NgSgJqiAHsCmijnys05dwr2DeoA8fEc1/BizdysBSqFoMbN5yjfqB8bpqdhjVFnr33ABiGiB/L9dlKmnK7nn+wTxZUqIkr9KaHL87yMiCdrljZHfi2iw/fiMK5x0Uwq8uliKTl0RA86X6v0BRyVLsPhcAMt3Q06kDrfj+a3kaekztAMLtG9vDIro34sbU0oEgyPq7C9f0EqRdiW/XIgQvnWTQjCCWO11QeEXzQVzNF+wRStwB2MzQXsCj388AhkPSsEqC21ghRzycDe6Q2OiR/+TA7yCkEW9DzipwnQ2dQQMwFzmXxSw35aO12u1Z+i480txDAE5LJSVZ1jhjuDbJu9QCgFI0QAyD3FBqiTD++YvpvqsTHfUVwi5N7cZVMP/+8CajOcYTjfzBwb1d+oWmL1UeQlH1Ow7BQsK94/FAogbk2qqMJm+8wefhlQYFM55kptc4xavQT8mxzT+fDHChziJvg5s5vpGBqU+jju2Qy40qatVq34+MSBbRLiIBwT9mumrHtyhe79E3q1Z7WI1J3D0gI60k4Lesh/b03n0Tx9W/aiob232AYFhp7tqrb3yjSwhgxJv8sFAOoV+vJCmUKZUHSl2rmHPhtGJhQVIASNnw7WO1t4sYDI8HKW8C59hy4YCJ4fILhxsPU8LFk6b2eVWomHUqgzWnXyhw5y2Wa72VztvGu0kYH3x422GoytGMxKA4xPRr9Zd5SPYe3Nz3s8scYocCOXhb1RhzyddMr1+2jZ/+DF85EZeLTNjX2fGkHVN/YxptPLxIFCb+4lB7htydEUaemO0OgO8WR0r76F22jOqLGLf09JM/7RdiRjyXAtJ/ltbhNE1pckXkX1nEPNfVv0E5JZRZwMN4taoBwqxsp70LFTxku+4zsrrkGcEzugKFmrrcuVhTLnQmKQZSxoX+GU4aI15290/giNlLxCp/+jP8ghWZZhyRx6lFTdEWjl8WscaavooSXM+60kPyJoKtKOELCjx5MfIHvB7ssLOKhgr1/ZxYhV8VdpwcACkaciRE/4ykhDr2s9JrTbtN83IcgEnNiWPCWohFD2MxVWvHcKaEQY/9V9cKlinongma+FxnSDs74uzrV8sKAuFuRfZgpo8e9x5nFKz4uFiyMZO8Hfa1qLBANwnEYA3V9Fh/XEobGRQvL0JYMZGWx8KmoeUPl6EvGo4ieWZ3Ow8DNyl/a6Pk5kn+pC+AuGBMORZBzznZQyIux8Ul1Jew3ux24fBNPPhghZqvNOaJlqNi528/UMbA676Q9KyEBYwothQpY8Q71OWTrEvDGjeABl3wIUJwNgyvwhFlSq4ZSJFY092vCihbS7vAlCzQTTrDN6Pty7kPuMZDEu0w+Ri77MQyvjz5BaEnT2uzmjQoZ//n+2xh/eGmH/+K89ynmsUrxLzK61gfcvYZNpxVpktD88xopAHtKfMi5UZORzqAThQqrGYgMtvOkFXko6OOlXWeL/1xzboLh1S/hazavoaZtxVOvBYeRHIqrWWH+t094sJ5DtWNoukkAdqd+OboRgrbUCR/lvihgm2SBOOPy9sUN9nxYw2CTdijSnrhqnuXV37pDIEp31d4biHE0HR2/iXVHZ3aS6UB6Xkqh5iiSbr00QAJw+KdDAKfoLpTVql45cbq/8BsebDXd+PfpMRv2Tc3YPRSifSiM+Vt1Bu+6y/zQ21Ia8PcA1k7klZn+fyhtd+FVeUkK6yOuQd+c3ZLEWfBityozBs7lafHHw8GE95E2Pg6XFgNf/dp1CDmeImiDVcrDGa+dE4h90i78bbz3ROF1UHMAhW5aW3EPYaUay23rzQbOVjXLQrN34xq4izgJ21l95eeydLaIu7rDQ82ZvWQfX9lFbeWP3ZH8V+PEq2PuojmlrpvET9bH8W0HU1k+W/owCgpFhAUw7/ytPoXYFw79/ih0U8GDqaytv+IBjjzYYvducWX7MUV+bS8pvAvkNRaXGRoSHxHT2tNolyIHfq8tNoVo2fYBe48IsgWpJcy3XxMq6eFFBrYWP0Ha7T0tZOc/RETUaoA3ZLQfz63iWxVSEetA9yw3LS6VuTseb6JLF6ggRAAkFlVWDZowiAQpbakr5hXphnetWFwIvW0YdQzPYoqr5RAdca2nCGIXGh74w9QI7e6qUf7ppQ/KedG7QAuspMvTXU2MDfhbCJ4wB4tEios7iq6tlVxDPK2FeZDbqChKG9a2OPy1JXQHHXBlaaw9h0pd8cF+uyt9LISapw87ZmlxT347xErivWw50jdm0oxgunhZP/Ne6umPynvMVDf/LbayFqrK33dWAwKkcBPxRbRFhAnTsAcR5e+hYtnGvNm8X8z2B/Lj09FBw38It3cmrdy6sA0fP+GwhvsyUT6bJRx4tKpizLldJY4+W0lmG2tNX+z0tJICUp8nriTEhBzzz9WRlkYf9pw2N6SwDjQ4ZEqfXnqq7S2zlVbB829ZI8wUyOvNOHEG41xZmcYiJUfbOTNewMAtNde31LM775a0DepINmS/GurwlAuEKN7egBauWgs7LZS45EvrX3xfdJUKZfR2y2uKSKjJjs7DOV+6HZjCmVmkf2hAH7K6DyVzbYp3h56SRxI0qCjfOuM9j0CwfgdHNLY0ToGxyZEkEG+ndDh+SDznEosMtxbhrntRAHDsnQBIGI6b9DEe7cIW4Z7GQf1bICnzQuL4NaIOSkW+z0hHrM8lwDDgK1EDQgY16/TvQMjvsu1HLBrX1Mxq4xvMt/+DPWvS7+RzUVyUSWaEVKUUHJ8bTAi9e3zUSRR7JXWOEvtNz9vMyD8G+jS5creAa3LdO8RIt21SjY8xqbKNnSePyaKD+E1yOwx4nksBa489UHA/6Z235jYZSQPcN1cfubcEvpcpmX71av/ErNf94XENTEFzlcJO5Ef8biIWExuI5ZWl+8ZW9tdLtQCyOQ20pAu3W6xRssL9jyDntBBHYCBONYg2qalOa5ZBXI9RvRnzIT9699tPrPW4TW2TePqI10/UNTWzuwc+hk2j9Z50X+XC129oSE6dtEzRIZovCrOf5SbIusnk1RFiFwSExkEKgYpOy0Cy4B5t6hM3CgvlDhJZVGAtuXT/TaSpxXLNm+1lcg4ehSoBIykMno6kymU4kUaPCBtB6Il6jwSUCRTLAt08bEAm8+MLQz04la6DAyGvzEjnAqacNU3/ykDcVVxyKJ9i5dCLZTfCD23MbhbMUomBIeg0h6z3RJncBnrxkLeoNCz2npuQMW+3ZM0/Z9jYMRamDN20q0YPlMfvm9VBEaIp1rARf0HsZ3TKVybHEXlbMKnbIWDKm7FNDTO16EdvBmqTUPmrRqKeEG09D5Gt1iweosnblZQkC+tdzUlNS2hl1Dl6ma2tNC8RpECvqwty5CLfZj0Sd/jPhCniNZrmzJYQnx4oVz5TbCBUex61v5yLAcdMFSHEM1lpBsX/596B2vKs6zkZFS5jGzNQMSDmTpYabU/Sa5z/DqaoksgCAS6btujjSkt+WzFQiE+enlV300UUr1/euNztShrVcs9I4od+WK2WkIwjcrpR2cbr7HeBN9i3ziaJduUXUHWliflpPw+NJo5saO9UFas/FXz6JQqhPFi8qD0Hx49jQRyX4LfY0ECOBFGfE5MHgc3FXhp6GtwLGRJfJa+wU+W6/l7btJ/nXWGgCCMPT7xDg1ZqoMld9snksPF6iOql36eDqxsFr7sYUIE2vB65rQ/nBk1BlM5BORyhkDEt0ueqt0uCVOOegN9spcz8OkBO9fjRGVw1ZWrCEZAC1K7eBzSkQbBWbgUhqfyL90tzszLprIatlUO/VO06Yo4s2MBqnNyzS6fGgDRax/2oVBeTFVNrrhVtbPPX8Jl5dOyixVyXJxQJ0rvcV4j+kDxmgGLXOazAYaQBEj00DA+9NVarcEORpP2gZXOyuP0PEOAm1tE/mRqqMM0Aa6+r4WxyBD35piFyJulpSy2Z3VX+9E9zYP1UZNzzIogi3MEfgrJy/mVdjg7xZSg7Fbo2HuqfepBvr2QqqnoHTl29FcNb2ubVTMOtclqWnpZfMS5YL8mP8NPU0LRo//IL11G7MNIZ6uD2YiexThWU7C8uCyGeQABBTfFpOU6KuZxEO4ByxT0wAXXMyfLfq/653w+CU2yKfsSrLVGk5dFegp9ms2pimAbH4d47lF4gkCXdIoFcRT6bpVZHPOaRXfKk+w1W2ahBeobNSnLYzbohfMTwkJjuvOoolpdk0Xcb6cx/DtuKRX2eenTEKXfYDvGPDK0vkCvlSJTnmJDKRn5tALN7WkJFfZLMfNthdYWvAhs/XMjztASTtslPOcn+7ogYEqbFkrYL49AGtnjsYwPBWjwCIre9/8mD8FpDuM4Aq8e8PamFy+3pqEwX9WgHN/nJIvHysdlcQvyfkwL72BsaXyl6LKYiXaFBcU69gCilWmB4BqsTVhhVF/lCGEE/peRy8Hj612JyXglbp3QhfwacJ8CmNzjJSjECDu2tlOTgCzE8xzXqSc6KbN8U/xUFEeVV6po93nsbmg0Z31qr3oZolhrsuAlrNu7yV9A0KoC/GPOOcP5q0YYef6+BSd/O/CLE7CgExtsw4P5O1K367NOAg2/euAmbdNB2TCbNFZgFnw4WbgArZJyhbH3cocO0coDKkEZAfSEHoDIDs28+xKT7J5gHNYhlHJZaHjnVOgZh4XHYgQiLWcKzOFKBZQPWrEIZCU4dIv2+boCGJRWmKkceDrHPJSqmECfyHfzaq9flSN6EiO1+tq3K+Tnw3TXDPz5aZzizIo4wiK32QppG8+f9YzMEDFkwff0lbMPH1W+V0cqysGJnPvYSmzdGnJBHkNx9GuIVuCl7gwe9OcoXxXMkwfF+TYPm9umt+pgf0EPlbAQ4Fw8NHSV1O0BHRljJiT4ZRJAiJ2zIecXSJ9+OBLtEQcsrVdPP7juYaTVeIjmwJ+C2l4z/+bTwqpYQJMjVT0EM1Lo+2SDzFXiPJRtELniUGP3uSpf7j83JBLIR1xc3jg2KAOVmNvG3KqrEoRKo+70bUmxtPWdGo4GR9huD5I0NuojN81zKNMtllbw9OGeG9vPoM+AAsq0h2JdCUiNRA2VBsYBSRTr0qV7Rb1IOMVKx41CWdmu3hdBbaERXbFNTUu9yAKovsdwmUd+SIbNdEC63Adfn26h4L7gr3ht/J7RBxx7FNiLc5Qwn7Z5B8ampexfjEIhG+Lbbkw+1h5JLtTrX/Wvnmu8iZh8lRaFTi3yRjfhEyexfYBQ37EyRtvA4v2WwVhe6nyowGxXnlYJHnnW8frm46pXeA9peqytmjHzaZ0TUTT6NeTqV9jhrHGh1xe3sr+eiZe90KWH2TCAHQdvMXVRVQM1OP9q58wP0DpvNtGFTuxPXccmbVW4LwEZjm0R4G1vCcBig3mzNpvSeony7FLL8p+B87hkPjPHFeWXrKjhmF/FfOHnjG/XXFu7TIfcd+WRhLoZPjuUAGzoQB1o10eva1QHbP6kXiz2U8NaTrzH6z9rT6VFTbuGtpL/YyPkoaKumaj6msxoxEu0AihZ8clxk/s87aj6Srb4AK1OJm9tPYUJPsaruubEQz/zEAhend6NYh+Rc2X1cHiZk2dp1cK44IDb2TE/4Rch8wPq/zISGmLugtcgzE2OQkBfzqeVkml/QzYy5dK4zw3t531nGi4mLy81i2IfBKsZlNJa0uV7sIdSofWdkOr4vnRnQzBOtjl07L+NdVncKsqxEdIoCL6pe/eDO2sLcMz5hABgzPj070dTHV8Fb16dV3F8KvBh2C/ddjjqLP+LX5ligyUQ7jcGlVxrw8qV7YUpwEao4Evrq2j3vVZArm0ldl3tMUDiCpqa5Zwy9DmLGNJI5qzB/4Ryu7z3cNqKD+oHRDAe8ANLHFjJno5ifxHRSaGFgr95LWAZnsQ4yt2dqYlv0QIPIKzyD1FgLYFN0JU7iIX+jLtkgKRFHt2JRK2Kh1ZqaU+GXRi6WwwumzVvFDPKDSP5ZlE8AA1Ib02/5WM+pU2bH9V8+fvNgwM59oi99k7QR/dlq7+9YS82EmOupvXjDVlYcvxbO5nD4C2ztaYwxm51DgWhJFeDoMopIanndJMYSSE2eNEccec4K5xvn2wmkrF1stAB0d/zh4JXISghlH4ujiz0Or23kjrNol7nL5FOXSy/Mns3kB0abKLb2J0K7EAb+D5W9L9Sk83Whw+F+2JyNa0pLarARJkXrrvVNjCzOy5kyBti7IggICeKuFyDN37XtqDXio8z/VGa4qOkVHxRM46K9VLEcUBSraXvpflClBg6Q7LeTYCGCAmDl7HARp0Sal/DRlDUO9sP0QRjsVbZ4EvUtipw3KB+1jUsgbPsio3whC3WN5Fzk3QoLGaiGy6pXWE7Op+/PzDhClm2RuzNjdqOMTwAhVps5deD0+r9qcR8s/z/IKufxH5dLJ/O+vq166Ajkrzar9cjafD53SkspnZRbzAMupifiW9/R+56/hff50HxrmO3evBPXgIkU/VLLGgMZZ/AW8PQu6Lhj6uFE7qGIVV9qTVmurmEq2KxNkriBIpdQCV4jl4OFoWM/es03SucWidvmplaspf4j8GIACF1YykbtoNJZmQUCcjcvvt84GBs0tVAnRLvZvTCT77TVhXVAZagaupPjwhBRLPROsqBsQwdK7eGeWKP/I7G8eKYVtvIIvGVY/HtG8uUjH8Ar9yoeHCnPuHCxV+ACT3qmNkbj0xHGfWxfbHM6ZOvQTomrXHk8d7c2GuBvZnjS/i+62mB2fWm5QwzIiZo8HgWsR337ba5KwpOh7UD0Uzjl9dsWxBhEkbpxjmubXr4ddTxr++LUAkj8oWpO5IJt3fnn2c1a58i25LCPbZWBqZVMJ07D0xIge7xWnv34F6vs5VLYR674N5+nWS2TNdE/h5YA9WrT32gJcUVukUTAdEAaKlo/bT+FH7i44K0Jwap/apzQtT5IjfOsJ8L2bG6vL0xYGDa9d4gh3vkG6JowJay7xo5uwt45UGqOQg56bS/SDGLn4Xwgj0XNrCT02aKV+e3rmM5HNJNXped5bO0bu8ymTWeLZMPt1keDocK+pI0YjluQenb7T2hnoJ18VhvC03g0H1E85WUxDDhYTa1QllfvDFi8h0erzA84hNtr5D+brPQNRT19IwcnXP45z2UYAeMsg3O1I6pg3gu4SLUoBpSDDj14M6zTFyO/RG+Ge1Iqdb7OAld0FvUn4iMkzoqbM9s8u4AuMq1GiFu+OdLTrsUIBOu9aCld9dBLJwTQKTnomq8i6WFVapiZoJMEN7aCF4+Txcvpe2ZadFLC8kmddEXC0P0uatbv3NPC2cbFyb5hVqh/6BKmv/yO585zI3kulG92AwYugVLKiMkr882agBJREx/RkQ==";

function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/* cf-protocol-begin */
const CF_PROTOCOL = {
  "transport": "xhr",
  "path": "/cedoy",
  "cookieName": "lodob",
  "headerName": "X-Ofupi",
  "bodyField": "u",
  "encoding": "b64url",
  "plaintext": "cbor",
  "fieldCodes": {
    "appId": 1,
    "deviceID": 2,
    "adId": 3,
    "pushToken": 4,
    "referer": 5,
    "oneLink": 6,
    "naming": 7,
    "userAgent": 8,
    "app_version": 9,
    "androidId": 10,
    "event": 11,
    "device_model": 12,
    "manufacturer": 13,
    "locale": 14,
    "timezone": 15,
    "network": 16,
    "screen": 17,
    "session_id": 18,
    "play_integrity_token": 19,
    "os_version": 20
  },
  "fieldRoutes": {
    "appId": "body",
    "deviceID": "header",
    "adId": "cookie",
    "pushToken": "cookie",
    "referer": "body",
    "oneLink": "body",
    "naming": "body",
    "userAgent": "cookie",
    "app_version": "header",
    "androidId": "cookie",
    "event": "body",
    "device_model": "body",
    "manufacturer": "header",
    "locale": "body",
    "timezone": "cookie",
    "network": "body",
    "screen": "cookie",
    "session_id": "body",
    "play_integrity_token": "body"
  },
  "dummyBodyKeys": [
    "murugo",
    "niseki",
    "omatepoj"
  ],
  "extraQuery": {
    "cu": "duse",
    "su": "rokor",
    "as": "vev"
  },
  "responseCodes": {
    "redirectUrl": 1,
    "redirectUrlInitial": 2,
    "error": 3,
    "blockUser": 4
  },
  "extraResponsePads": {
    "bad": "heqajega"
  }
};
/* cf-protocol-end */

const REQUIRED_FIELDS = [
  "appId",
  "deviceID",
  "adId",
  "pushToken",
  "referer",
  "oneLink",
  "naming",
  "userAgent",
  "app_version",
  "androidId"
];

/* ============================= */
/* PBKDF2-SHA256 + AES-256-GCM   */
/* ============================= */

const AES_PASSWORD = "HmpprH4NQucDtVczmt1O3RXU5Hy1";
const AES_SALT = new Uint8Array([
  0xff, 0x89, 0x10, 0xa0, 0xb6, 0xb0, 0x7f, 0x0f,
  0xfb, 0x4e, 0x7b, 0x5a, 0xbf, 0xd4, 0x5a, 0xb7,
]);
const AES_PBKDF2_ITERATIONS = 100000;
const AES_IV_LEN = 12;

let cachedKeyPromise = null;
function getAesKey() {
  if (!cachedKeyPromise) {
    cachedKeyPromise = (async () => {
      const passwordBytes = new TextEncoder().encode(AES_PASSWORD);
      const baseKey = await crypto.subtle.importKey(
        "raw", passwordBytes, "PBKDF2", false, ["deriveKey"]
      );
      return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: AES_SALT, iterations: AES_PBKDF2_ITERATIONS, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    })();
  }
  return cachedKeyPromise;
}

/* ============================= */
/* base64url (RFC 4648 §5)       */
/* ============================= */

const B64U_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function bytesToB64u(bytes) {
  let out = "";
  const len = bytes.length;
  let i = 0;
  while (i + 2 < len) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2];
    out +=
      B64U_ALPHABET[a >> 2] +
      B64U_ALPHABET[((a & 3) << 4) | (b >> 4)] +
      B64U_ALPHABET[((b & 15) << 2) | (c >> 6)] +
      B64U_ALPHABET[c & 63];
    i += 3;
  }
  const rem = len - i;
  if (rem === 1) {
    const a = bytes[i];
    out += B64U_ALPHABET[a >> 2] + B64U_ALPHABET[(a & 3) << 4];
  } else if (rem === 2) {
    const a = bytes[i], b = bytes[i + 1];
    out +=
      B64U_ALPHABET[a >> 2] +
      B64U_ALPHABET[((a & 3) << 4) | (b >> 4)] +
      B64U_ALPHABET[(b & 15) << 2];
  }
  return out;
}

function b64uIndex(ch) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) return code - 65;      // A-Z
  if (code >= 97 && code <= 122) return code - 71;     // a-z
  if (code >= 48 && code <= 57) return code + 4;       // 0-9
  if (code === 45) return 62;                          // -
  if (code === 95) return 63;                          // _
  return -1;
}

function b64uToBytes(str) {
  const normalized = String(str || "").replace(/=+$/, "");
  const len = normalized.length;
  if (len === 0) return new Uint8Array(0);
  const outLen = Math.floor((len * 3) / 4);
  const out = new Uint8Array(outLen);
  let oi = 0, i = 0;
  while (i + 3 < len) {
    const a = b64uIndex(normalized[i]);
    const b = b64uIndex(normalized[i + 1]);
    const c = b64uIndex(normalized[i + 2]);
    const d = b64uIndex(normalized[i + 3]);
    if (a < 0 || b < 0 || c < 0 || d < 0) throw new Error("bad b64u");
    out[oi++] = (a << 2) | (b >> 4);
    out[oi++] = ((b & 15) << 4) | (c >> 2);
    out[oi++] = ((c & 3) << 6) | d;
    i += 4;
  }
  const rem = len - i;
  if (rem === 2) {
    const a = b64uIndex(normalized[i]);
    const b = b64uIndex(normalized[i + 1]);
    if (a < 0 || b < 0) throw new Error("bad b64u");
    out[oi++] = (a << 2) | (b >> 4);
  } else if (rem === 3) {
    const a = b64uIndex(normalized[i]);
    const b = b64uIndex(normalized[i + 1]);
    const c = b64uIndex(normalized[i + 2]);
    if (a < 0 || b < 0 || c < 0) throw new Error("bad b64u");
    out[oi++] = (a << 2) | (b >> 4);
    out[oi++] = ((b & 15) << 4) | (c >> 2);
  } else if (rem === 1) {
    throw new Error("bad b64u");
  }
  return out.subarray(0, oi);
}

/* ============================= */
/* Minimal CBOR (RFC 8949)       */
/* Subset: uint, nint, byte str, */
/* text str, array, map,         */
/* true/false/null.              */
/* ============================= */

const CBOR_TEXT_DECODER = new TextDecoder();

function cborDecode(bytes) {
  let pos = 0;

  function readUint(ai) {
    if (ai < 24) return ai;
    if (ai === 24) {
      if (pos >= bytes.length) throw new Error("cbor EOF");
      return bytes[pos++];
    }
    if (ai === 25) {
      if (pos + 2 > bytes.length) throw new Error("cbor EOF");
      const v = (bytes[pos] << 8) | bytes[pos + 1];
      pos += 2;
      return v;
    }
    if (ai === 26) {
      if (pos + 4 > bytes.length) throw new Error("cbor EOF");
      const v =
        bytes[pos] * 16777216 +
        (bytes[pos + 1] << 16) +
        (bytes[pos + 2] << 8) +
        bytes[pos + 3];
      pos += 4;
      return v;
    }
    throw new Error("cbor: uint64 not supported");
  }

  function readNext() {
    if (pos >= bytes.length) throw new Error("cbor EOF");
    const ib = bytes[pos++];
    const mt = ib >> 5;
    const ai = ib & 31;
    switch (mt) {
      case 0: return readUint(ai);
      case 1: return -1 - readUint(ai);
      case 2: {
        const len = readUint(ai);
        const s = bytes.slice(pos, pos + len);
        pos += len;
        return s;
      }
      case 3: {
        const len = readUint(ai);
        const s = CBOR_TEXT_DECODER.decode(bytes.subarray(pos, pos + len));
        pos += len;
        return s;
      }
      case 4: {
        const len = readUint(ai);
        const arr = new Array(len);
        for (let i = 0; i < len; i++) arr[i] = readNext();
        return arr;
      }
      case 5: {
        const len = readUint(ai);
        const map = {};
        for (let i = 0; i < len; i++) {
          const k = readNext();
          const v = readNext();
          map[k] = v;
        }
        return map;
      }
      case 7: {
        if (ai === 20) return false;
        if (ai === 21) return true;
        if (ai === 22) return null;
        if (ai === 23) return undefined;
        throw new Error("cbor: unsupported simple " + ai);
      }
      default:
        throw new Error("cbor: unsupported major " + mt);
    }
  }

  return readNext();
}

function cborEncode(value) {
  const parts = [];

  function writeHead(mt, n) {
    const tag = mt << 5;
    if (n < 24) {
      parts.push(new Uint8Array([tag | n]));
    } else if (n < 256) {
      parts.push(new Uint8Array([tag | 24, n]));
    } else if (n < 65536) {
      parts.push(new Uint8Array([tag | 25, (n >> 8) & 255, n & 255]));
    } else {
      parts.push(new Uint8Array([
        tag | 26,
        (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255
      ]));
    }
  }

  function write(v) {
    if (v === null || v === undefined) {
      parts.push(new Uint8Array([0xf6]));
      return;
    }
    if (v === true)  { parts.push(new Uint8Array([0xf5])); return; }
    if (v === false) { parts.push(new Uint8Array([0xf4])); return; }
    if (typeof v === "number" && Number.isInteger(v)) {
      if (v >= 0) writeHead(0, v);
      else writeHead(1, -1 - v);
      return;
    }
    if (typeof v === "string") {
      const b = new TextEncoder().encode(v);
      writeHead(3, b.length);
      parts.push(b);
      return;
    }
    if (v instanceof Uint8Array) {
      writeHead(2, v.length);
      parts.push(v);
      return;
    }
    if (Array.isArray(v)) {
      writeHead(4, v.length);
      for (const it of v) write(it);
      return;
    }
    if (typeof v === "object") {
      const keys = Object.keys(v);
      writeHead(5, keys.length);
      for (const k of keys) {
        if (/^-?\d+$/.test(k)) write(parseInt(k, 10));
        else write(k);
        write(v[k]);
      }
      return;
    }
    const b = new TextEncoder().encode(String(v));
    writeHead(3, b.length);
    parts.push(b);
  }

  write(value);
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

/* ============================= */
/* AES-GCM glue (bytes <-> b64u) */
/* ============================= */

async function encryptBytesB64u(plaintextBytes) {
  try {
    const key = await getAesKey();
    const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LEN));
    const ct = new Uint8Array(await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, key, plaintextBytes
    ));
    const out = new Uint8Array(AES_IV_LEN + ct.length);
    out.set(iv, 0);
    out.set(ct, AES_IV_LEN);
    return bytesToB64u(out);
  } catch {
    return "";
  }
}

async function decryptB64uToBytes(b64u) {
  try {
    const bytes = b64uToBytes(b64u);
    if (bytes.length < AES_IV_LEN + 16) return null;
    const iv = bytes.slice(0, AES_IV_LEN);
    const ctWithTag = bytes.slice(AES_IV_LEN);
    const key = await getAesKey();
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv }, key, ctWithTag
    );
    return new Uint8Array(pt);
  } catch {
    return null;
  }
}

/* ============================= */
/* Helpers                       */
/* ============================= */

const B64U_RE = /^[A-Za-z0-9_-]+$/;

function clean(value, max = 2048) {
  return String(value || "").trim().slice(0, max);
}

function multiDecode(value) {
  let raw = String(value || "").trim();
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded === raw) break;
      raw = decoded;
    } catch {
      break;
    }
  }
  return raw.trim();
}

function parseMaybeJson(value) {
  if (value == null) return "";
  if (typeof value !== "string") return value;
  const raw = value.trim().slice(0, 4096);
  if (!raw) return "";
  try { return JSON.parse(raw); } catch { return raw; }
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : "";
}

function cleanUrl(value) {
  const raw = clean(value, 4096);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function buildCodeToName() {
  const out = {};
  const codes = CF_PROTOCOL.fieldCodes || {};
  for (const name of Object.keys(codes)) {
    out[codes[name]] = name;
  }
  return out;
}

let CODE_TO_NAME_CACHE = null;
function codeToName() {
  if (!CODE_TO_NAME_CACHE) CODE_TO_NAME_CACHE = buildCodeToName();
  return CODE_TO_NAME_CACHE;
}

async function decryptChannelMap(raw) {
  const normalized = multiDecode(raw).replace(/=+$/, "");
  if (!normalized || !B64U_RE.test(normalized)) return {};

  const bytes = await decryptB64uToBytes(normalized);
  if (!bytes) return {};

  let decoded;
  try { decoded = cborDecode(bytes); }
  catch { return {}; }

  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) return {};

  const lookup = codeToName();
  const out = {};
  for (const k of Object.keys(decoded)) {
    const code = parseInt(k, 10);
    const name = Number.isFinite(code) ? lookup[code] : null;
    if (!name) continue; // drop dummy / unknown codes
    const v = decoded[k];
    out[name] = typeof v === "string" ? clean(v, 4096) : v;
  }
  if (out.naming && typeof out.naming === "string") {
    out.naming = parseMaybeJson(out.naming);
  }
  return out;
}

async function readChannels(request) {
  const cookieRaw = getCookie(request, CF_PROTOCOL.cookieName);
  const headerRaw = request.headers.get(CF_PROTOCOL.headerName) || "";
  const [cookie, header] = await Promise.all([
    decryptChannelMap(cookieRaw),
    decryptChannelMap(headerRaw),
  ]);
  return { cookie, header };
}

async function readBody(request) {
  const text = (await request.text()).trim();
  if (!text) return {};

  let blob = text;
  if (!B64U_RE.test(blob.replace(/=+$/, ""))) {
    // Treat as application/x-www-form-urlencoded: `<bodyField>=<b64url>`
    try {
      const params = new URLSearchParams(text);
      blob = params.get(CF_PROTOCOL.bodyField || "d") || "";
    } catch {
      blob = "";
    }
  }
  if (!blob) return {};
  return decryptChannelMap(blob);
}

function takeField(cookie, header, body, key) {
  return cookie[key] ?? header[key] ?? body[key] ?? "";
}

/* ============================= */
/* Response                      */
/* ============================= */

async function encryptedResponse(obj, status = 200) {
  console.log("[cf] encryptedResponse (расшифрованное для приложения):", JSON.stringify(obj));
  const codes = CF_PROTOCOL.responseCodes || {};
  const mapped = {};
  if (obj.redirectUrl != null)
    mapped[codes.redirectUrl ?? "redirectUrl"] = obj.redirectUrl;
  if (obj.redirectUrlInitial != null)
    mapped[codes.redirectUrlInitial ?? "redirectUrlInitial"] = obj.redirectUrlInitial;
  if (obj.error != null)
    mapped[codes.error ?? "error"] = obj.error;
  if (obj.blockUser != null)
    mapped[codes.blockUser ?? "blockUser"] = obj.blockUser;

  Object.assign(mapped, CF_PROTOCOL.extraResponsePads || {});

  const payload = Object.keys(mapped).length ? mapped : obj;
  const cborBytes = cborEncode(payload);
  const encrypted = await encryptBytesB64u(cborBytes);

  return new Response(encrypted, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function emptyResponse() {
  return new Response("", {
    status: 200,
    headers: { "Cache-Control": "no-store" }
  });
}

/* ============================= */
/* Country + local blockers      */
/* ============================= */

async function getCCByIp(ip) {
  try {
    if (!ip || ip === "unknown") return null;
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,message`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.status === "success") return data.countryCode;
    return null;
  } catch {
    return null;
  }
}

async function resolveCountry(request, ip) {
  const cfCountry = request.cf?.country || "";
  if (cfCountry) return cfCountry;
  return await getCCByIp(ip);
}

function isGoogleProvider(request) {
  const asOrg = request.cf?.asOrganization || "";
  const asn = request.cf?.asn;
  if (asn === 15169) return true;
  if (!asOrg) return false;
  return asOrg.toLowerCase().includes("google");
}

function isEmulatorUA(ua) {
  if (!ua) return true;
  const u = ua.toLowerCase();
  return (
    u.includes("sdk_gphone") ||
    u.includes("emulator") ||
    u.includes("generic") ||
    u.includes("google_sdk") ||
    u.includes("headless") ||
    u.includes("bot") ||
    u.includes("crawl")
  );
}

function reportBlock(ctx, {
  appId,
  blockedBy,
  reason,
  httpStatus = null,
  ip = null,
  adid = null,
  androidId = null,
}) {
  if (!ctx || !BLOCK_MONITOR_URL || !BLOCK_MONITOR_TOKEN) return;

  const id = String(appId || "").trim();
  const source = String(blockedBy || "").trim();
  if (!id || !source) {
    console.error("[block-monitor] skip invalid appId or blockedBy", reason);
    return;
  }

  ctx.waitUntil(
    fetch(BLOCK_MONITOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BLOCK_MONITOR_TOKEN}`,
      },
      body: JSON.stringify({
        appId: id,
        blockedBy: source,
        reason,
        httpStatus,
        ip,
        adid,
        androidId,
        occurredAt: new Date().toISOString(),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          throw new Error(`Block monitor returned ${response.status} ${detail}`.trim());
        }
      })
      .catch((error) => {
        console.error("[block-monitor]", error.message);
      }),
  );
}

/* ============================= */
/* Handler                       */
/* ============================= */

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/favicon.ico") {
        return emptyResponse();
      }

      const ip =
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "unknown";

      if (request.method === "GET" && url.pathname === "/dex") {
        const bytes = base64ToUint8Array(DEX_ENC_B64);
        console.log("[cf] /dex — отдаём", bytes.length, "байт (зашифрованный DEX), ip:", ip);
        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Cache-Control": "max-age=86400",
          },
        });
      }

      // Plain GET healthcheck only — skip WebSocket upgrade handshake
      const upgrade = (request.headers.get("Upgrade") || "").toLowerCase();
      if (request.method === "GET" && upgrade !== "websocket") {
        return new Response("OK", { status: 200 });
      }

      if (request.method !== "POST") {
        return emptyResponse();
      }

      console.log("[cf] запрос", request.method, url.pathname + url.search, "ip:", ip);

      const country = await resolveCountry(request, ip);
      console.log("[cf] страна:", country || "неизвестно");

      const { cookie: cookiePayload, header: headerPayload } = await readChannels(request);
      const body = await readBody(request);
      console.log("[cf] декодированные каналы — cookie:", JSON.stringify(cookiePayload), "header:", JSON.stringify(headerPayload), "body:", JSON.stringify(body));
      if (body.naming && typeof body.naming === "string") {
        body.naming = parseMaybeJson(body.naming);
      }

      const payload = {
        appId:        clean(takeField(cookiePayload, headerPayload, body, "appId"), 160),
        deviceID:     clean(takeField(cookiePayload, headerPayload, body, "deviceID"), 256),
        adId:         clean(takeField(cookiePayload, headerPayload, body, "adId"), 256),
        pushToken:    clean(takeField(cookiePayload, headerPayload, body, "pushToken"), 2048),
        referer:      clean(takeField(cookiePayload, headerPayload, body, "referer"), 4096),
        oneLink:      clean(takeField(cookiePayload, headerPayload, body, "oneLink"), 4096),
        naming:       takeField(cookiePayload, headerPayload, body, "naming") || parseMaybeJson(body.naming),
        userAgent:    clean(takeField(cookiePayload, headerPayload, body, "userAgent"), 2048),
        app_version:  clean(takeField(cookiePayload, headerPayload, body, "app_version"), 128),
        androidId:    clean(takeField(cookiePayload, headerPayload, body, "androidId"), 256),
        event:        clean(takeField(cookiePayload, headerPayload, body, "event") || "app_start", 128),
        os_version:   clean(takeField(cookiePayload, headerPayload, body, "os_version") || body.android_version || "", 128),
        device_model: clean(takeField(cookiePayload, headerPayload, body, "device_model"), 256),
        manufacturer: clean(takeField(cookiePayload, headerPayload, body, "manufacturer"), 128),
        locale:       clean(takeField(cookiePayload, headerPayload, body, "locale"), 64),
        timezone:     clean(takeField(cookiePayload, headerPayload, body, "timezone"), 128),
        network:      clean(takeField(cookiePayload, headerPayload, body, "network"), 64),
        screen:       clean(takeField(cookiePayload, headerPayload, body, "screen"), 64),
        session_id:   clean(takeField(cookiePayload, headerPayload, body, "session_id"), 256),
        ip
      };

      console.log("[cf] payload appId:", payload.appId, "adId:", payload.adId, "androidId:", payload.androidId, "ua:", (payload.userAgent || "").slice(0, 80));

      const ua = payload.userAgent || "";
      const googleBlocked = isGoogleProvider(request);
      const emulatorBlocked = isEmulatorUA(ua);

      if (googleBlocked || emulatorBlocked) {
        const reason = googleBlocked ? "google_provider" : "emulator_ua";
        reportBlock(ctx, {
          appId: payload.appId,
          blockedBy: "api",
          reason,
          httpStatus: 202,
          ip,
          adid: payload.adId || payload.deviceID || null,
          androidId: payload.androidId || null,
        });
        console.log("[cf] заблокировано", reason, payload.appId || "");
        return await encryptedResponse({ error: "error_202" });
      }

      const upstream = await fetch(UPSTREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": ip,
          "X-Client-IP": ip,
          "CF-Country": country || "",
          "CF-Ray": request.headers.get("cf-ray") || "",
          "X-Click-Token": env.ACCESS_TOKEN_ENABLE || ""
        },
        body: JSON.stringify(payload)
      });

      const upstreamStatus = upstream.status;
      const textResponse = await upstream.text();
      console.log("[cf] апстрим статус:", upstreamStatus, "тело:", textResponse.slice(0, 300));

      if (upstreamStatus === 202) {
        reportBlock(ctx, {
          appId: payload.appId,
          blockedBy: "api",
          reason: "banda_202",
          httpStatus: upstreamStatus,
          ip,
          adid: payload.adId || payload.deviceID || null,
          androidId: payload.androidId || null,
        });
        console.log("[cf] заблокировано", "banda_202", payload.appId || "");
        return await encryptedResponse({ error: "error_202" });
      }

      const cleanResponse = textResponse
        .trim()
        .replace(/^"+|"+$/g, "")
        .replace(/^'+|'+$/g, "")
        .replace(/\\/g, "");

      const redirectInitial = cleanUrl(cleanResponse);

      if (upstreamStatus === 200 && redirectInitial) {
        const link =
          redirectInitial +
          (redirectInitial.includes("?") ? "&" : "?") +
          "sub_id_12=trusted";
        console.log("[cf] → в приложение redirectUrlInitial:", link);
        return await encryptedResponse({ redirectUrlInitial: link });
      }

      console.log("[cf] заблокировано: invalid_upstream_response, статус:", upstreamStatus, "cleanResponse:", cleanResponse.slice(0, 200));
      return emptyResponse();

    } catch (err) {
      console.log("[cf] заблокировано", "worker_error", err && err.message ? err.message : "");
      return emptyResponse();
    }
  }
};
